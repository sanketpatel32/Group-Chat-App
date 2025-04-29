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
        // Fetch all chats from the server
        const response = await axios.get(`${baseurl}/chat/getAll`, {
            headers: { Authorization: `Bearer ${token}` }, // Include token for authentication
        });

        const chats = response.data.chats; // Extract chats from the response
        const chatList = document.getElementById("allChat");

        // Clear the chat container before populating
        chatList.innerHTML = "";

        // Get the current user's ID (assuming it's stored in the token or elsewhere)
        const currentUserId = response.data.currentUserId;

        // Populate the chat container with messages
        chats.forEach((chat) => {
            const li = document.createElement("li");
            li.textContent = `${chat.user.name}: ${chat.message}`; // Display user name and message

            // Add a class to differentiate between current user's messages and others
            if (chat.user.id === currentUserId) {
                li.classList.add("my-message");
            } else {
                li.classList.add("other-message");
            }

            chatList.appendChild(li);
        });

        // Scroll to the bottom of the chat container
        chatList.scrollTop = chatList.scrollHeight;
    } catch (error) {
        console.error("Error fetching chats:", error);
        alert("Failed to load chats. Please try again.");
    }
};
// Ensure the script is executed only once
document.addEventListener("DOMContentLoaded", () => {
    getChatHandler();
    setInterval(getChatHandler, 1000); 
});