const baseurl = "http://localhost:3000/api";
const token = localStorage.getItem("token");

// Function to handle sending a chat message
const submitChatHandler = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const message = document.getElementById("message").value.trim();

    if (!message) {
        alert("Message cannot be empty!");
        return;
    }

    try {
        // Send the message to the server
        await axios.post(
            `${baseurl}/chat/send`,
            { message: message }, // Request body
            { headers: { Authorization: `Bearer ${token}` } } // Headers
        );

        // Clear the input field after successful submission
        document.getElementById("message").value = "";

        // Refresh the chat list to include the new message
        await getChatHandler();
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    }
};

// Function to fetch and populate the chat container with messages
const getChatHandler = async () => {
    try {
        let storedChats = JSON.parse(localStorage.getItem("recentChats")) || [];
        const lastMessageId = storedChats.length ? storedChats[storedChats.length - 1].id : 0;

        const response = await axios.get(`${baseurl}/chat/getNew?lastMessageId=${lastMessageId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const newChats = response.data.chats;
        const currentUserId = response.data.currentUserId;

        // Merge and deduplicate chats
        const mergedChats = [...storedChats, ...newChats];
        const uniqueChats = Array.from(new Map(mergedChats.map(c => [c.id, c])).values()).slice(-10);

        localStorage.setItem("recentChats", JSON.stringify(uniqueChats));

        // Render chats
        const chatList = document.getElementById("allChat");
        chatList.innerHTML = "";
        uniqueChats.forEach(chat => {
            const li = document.createElement("li");
            li.textContent = `${chat.user.name}: ${chat.message}`;
            li.classList.add(chat.user.id === currentUserId ? "my-message" : "other-message");
            chatList.appendChild(li);
        });
        chatList.scrollTop = chatList.scrollHeight;
    } catch (error) {
        console.error("Error fetching new chats:", error);
    }
};

// Ensure the script is executed only once
document.addEventListener("DOMContentLoaded", () => {
    const localChats = JSON.parse(localStorage.getItem("recentChats")) || [];
    const chatList = document.getElementById("allChat");

    localChats.forEach(chat => {
        const li = document.createElement("li");
        li.textContent = `${chat.user.name}: ${chat.message}`;
        li.classList.add("other-message"); // Use dummy class until real userId fetched
        chatList.appendChild(li);
    });

    getChatHandler(); // Fetch newer messages
    setInterval(getChatHandler, 1000);
});
