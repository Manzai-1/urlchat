chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch(msg.perform){
    case "addmessage": {
      const date = new Date().toISOString().slice(0, 16).replace("T", " ");

      getCurrentTab().then(url => {
        sendMessage(cleanUrl(url), msg.author, date, msg.message).then(result => {
          sendResponse({data: result})
        });
      });

      return true
    }
    case "getmessages": {

      getCurrentTab().then(url => {
        fetchMessages(cleanUrl(url)).then(response => {
          sendResponse({data: sortMessages(response)});
        })
      })
      return true
    }
  }
})

const sortMessages = (messages:[any]) => {
  return messages.sort((b, a) => {
    const aDate:any = new Date(a.date);
    const bDate:any = new Date(b.date);
    return aDate - bDate;
  });
}

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab.url;
}

async function fetchMessages(url) {
  const endPoint = "https://us-central1-urlchat-93ae4.cloudfunctions.net/getmessages"
  try {
    const response = await fetch(endPoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({"url":url})
    })
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`${response.status} - ${endPoint}`)
    }
  } catch (error) {
    return `Error: ${error}`
  }
}

async function sendMessage(url, author, date, message) {
  const endPoint = "https://us-central1-urlchat-93ae4.cloudfunctions.net/addmessage"
  try {
    const response = await fetch(endPoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        "url":url,
        "author":author,
        "date":date,
        "message":message
      })
    })
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error(`${response.status} - ${endPoint}`)
    }
  } catch (error) {
    return `Error: ${error}`
  }
}


const cleanUrl = (str) => {
  return [...str].filter(isAccepterChar).join('');
}

const isAccepterChar = (c) => { 
  let cc = c.charCodeAt(0);
  return (cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122)
}