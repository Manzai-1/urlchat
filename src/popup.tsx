import { useEffect, useState } from "react"

import "./style.css"

function IndexPopup() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    { id: "", author: "", date: "", message: "" }
  ])
  const [user, setUser] = useState("maz")
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    if (hasFetched) {
      return
    }
    fetchMessages()
    setHasFetched(true)
  })

  const fetchMessages = () => {
    chrome.runtime.sendMessage({ perform: "getmessages" }, (response) => {
      setMessages(response.data)
    })
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
  }

  const handleInputSave = (e) => {
    e.preventDefault()
    chrome.runtime.sendMessage(
      { perform: "addmessage", author: user, message: message },
      (response) => {
        console.log(response.data)
        fetchMessages()
      }
    )
    e.target.firstChild.value = ""
  }

  return (
    <div className="popup-container">
      <form onSubmit={handleInputSave} className="message-form">
        <input
          type="text"
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
      <button onClick={fetchMessages} className="refresh-button">
        Refresh Messages
      </button>
      <ul className="message-list">
        {messages[0].id &&
          messages.map((m) => {
            return (
              <li key={m.id} className="message-item">
                <div className="message-meta">
                  <p className="message-author">{m.author}</p>
                  <p className="message-date">{m.date}</p>
                </div>
                <p className="message-text">{m.message}</p>
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export default IndexPopup
