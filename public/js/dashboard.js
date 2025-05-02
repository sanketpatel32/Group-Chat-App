const baseurl = "http://localhost:3000/api";
const token = localStorage.getItem("token");
let selectedGroupId = null; // Track the currently selected group

// Function to handle sending a chat message
const submitChatHandler = async (event) => {
    event.preventDefault();

    const message = document.getElementById("message").value.trim();

    if (!message) {
        alert("Message cannot be empty!");
        return;
    }

    if (!selectedGroupId) {
        alert("Please select a group to send a message!");
        return;
    }

    try {
        await axios.post(
            `${baseurl}/chat/send`,
            { message, groupId: selectedGroupId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        document.getElementById("message").value = ""; // Clear input
        await getChatHandler(selectedGroupId); // Refresh chats
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    }
};

// Function to fetch and display chats for a group
const getChatHandler = async (groupId) => {
    try {
        const response = await axios.get(`${baseurl}/chat/getAll`, {
            params: { groupId },
            headers: { Authorization: `Bearer ${token}` },
        });

        const chats = response.data.chats;
        const currentUserId = response.data.currentUserId;

        const chatList = document.getElementById("allChat");
        chatList.innerHTML = ""; // Clear existing chats

        chats.forEach((chat) => {
            const li = document.createElement("li");
            li.textContent = `${chat.user.name}: ${chat.message}`;
            li.classList.add(chat.user.id === currentUserId ? "my-message" : "other-message");
            chatList.appendChild(li);
        });

        chatList.scrollTop = chatList.scrollHeight; // Scroll to the bottom
    } catch (error) {
        console.error("Error fetching chats:", error);
        alert("Failed to load chats. Please try again.");
    }
};


// Function to fetch and display groups in the sidebar
const fetchGroups = async () => {
    try {
        const response = await axios.get(`${baseurl}/groups/getGroups`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const groups = response.data.groups;
        const groupList = document.getElementById("groupList");
        groupList.innerHTML = ""; // Clear existing groups

        if (groups.length === 0) {
            alert("No groups available. Please create a group.");
            return;
        }

        groups.forEach((group, index) => {
            const li = document.createElement("li");
            li.textContent = group.name;
            li.classList.add("group-item");
            li.onclick = () => selectGroup(group.id, li);
            groupList.appendChild(li);

            // Automatically select the first group
            if (index === 0) {
                selectGroup(group.id, li);
            }
        });
    } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Failed to load groups. Please try again.");
    }
};

// Function to handle group selection
const selectGroup = (groupId, groupElement) => {
    if (selectedGroupId === groupId) return;

    selectedGroupId = groupId;

    const groupItems = document.querySelectorAll(".group-item");
    groupItems.forEach((item) => item.classList.remove("selected-group"));
    groupElement.classList.add("selected-group");

    getChatHandler(groupId);
};

// Function to handle adding a new group
const addGroupHandler = async (event) => {
    event.preventDefault();

    const groupName = document.getElementById("groupName").value.trim();

    if (!groupName) {
        alert("Group name cannot be empty!");
        return;
    }

    try {
        const response = await axios.post(
            `${baseurl}/groups/create`,
            { name: groupName },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const newGroup = response.data.group;

        const groupList = document.getElementById("groupList");
        const li = document.createElement("li");
        li.textContent = newGroup.name;
        li.classList.add("group-item");
        li.onclick = () => selectGroup(newGroup.id, li);
        groupList.appendChild(li);

        document.getElementById("groupName").value = ""; // Clear input
        alert("Group created successfully!");
    } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group. Please try again.");
    }
};

// Function to handle adding a user to a group
const addUserHandler = async (event) => {
    event.preventDefault();

    const userEmail = document.getElementById("userEmail").value.trim();

    if (!userEmail) {
        alert("Email cannot be empty!");
        return;
    }

    if (!selectedGroupId) {
        alert("Please select a group to add a user!");
        return;
    }

    try {
        const response = await axios.post(
            `${baseurl}/groups/addUser`,
            { groupId: selectedGroupId, email: userEmail },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data.status); // Show success message
        document.getElementById("userEmail").value = ""; // Clear input
    } catch (error) {
        console.error("Error adding user to group:", error);
        alert(error.response?.data?.error || "Failed to add user. Please try again.");
    }
};

// Initialize the dashboard
// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
    fetchGroups();

    // Periodically fetch chats for the selected group
    setInterval(() => {
        if (selectedGroupId) {
            getChatHandler(selectedGroupId); // Pass the selected group ID
        }
    }, 5000);
});