const baseurl = "http://localhost:3000/api";
const token = localStorage.getItem("token");
let selectedGroupId = null; // Track the currently selected group
let isAdmin = false; // Track if the current user is an admin
let currentUserId = null; // Track the current user's ID

// Connect to the Socket.IO server
const socket = io("http://localhost:3000"); // Replace with your server URL

// Function to handle sending a chat message
const submitChatHandler = async (event) => {
    event.preventDefault();

    const message = document.getElementById("message").value.trim();
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0]; // Get the selected file

    if (!message && !file) {
        alert("Message or file is required!");
        return;
    }

    if (!selectedGroupId) {
        alert("Please select a group to send a message!");
        return;
    }

    try {
        let savedMessage;

        if (file) {
            // If a file is selected, upload it
            const formData = new FormData();
            formData.append("file", file);
            formData.append("groupId", selectedGroupId);

            const response = await axios.post(`${baseurl}/chat/uploadFile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            savedMessage = response.data.chat; // The saved file message from the backend
        } else {
            // If no file, send a text message
            const response = await axios.post(
                `${baseurl}/chat/send`,
                { message, groupId: selectedGroupId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            savedMessage = response.data.chat; // The saved chat message from the backend
        }

        // Emit the message to the server via Socket.IO for real-time updates
        socket.emit("sendMessage", {
            groupId: selectedGroupId,
            message: savedMessage.message,
            fileUrl: savedMessage.fileUrl || null, // Include file URL if available
            user: savedMessage.user, // Use the user data returned from the backend
        });

        document.getElementById("message").value = ""; // Clear input
        fileInput.value = ""; // Clear file input
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
        currentUserId = response.data.currentUserId; // Assign currentUserId from the response

        const chatList = document.getElementById("allChat");
        chatList.innerHTML = ""; // Clear existing chats

        chats.forEach((chat) => {
            const li = document.createElement("li");

            if (chat.fileUrl) {
                // If the message is a file, display it as an image or link
                li.innerHTML = `
                    <strong>${chat.user.name}:</strong>
                    <a href="${chat.fileUrl}" target="_blank">
                        <img src="${chat.fileUrl}" alt="Shared File" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />
                    </a>
                `;
            } else {
                // If the message is text, display it normally
                li.textContent = `${chat.user.name}: ${chat.message}`;
            }

            li.classList.add(chat.user.id === currentUserId ? "my-message" : "other-message");
            chatList.appendChild(li);
        });

        chatList.scrollTop = chatList.scrollHeight; // Scroll to the bottom
    } catch (error) {
        console.error("Error fetching chats:", error);
        alert("Failed to load chats. Please try again.");
    }
};

// Listen for real-time chat messages
socket.on("receiveMessage", (data) => {
    if (data.groupId === selectedGroupId) {
        const chatList = document.getElementById("allChat");
        const li = document.createElement("li");

        if (data.fileUrl) {
            // If the message is a file, display it as an image or link
            li.innerHTML = `
                <strong>${data.user.name}:</strong>
                <a href="${data.fileUrl}" target="_blank">
                    <img src="${data.fileUrl}" alt="Shared File" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />
                </a>
            `;
        } else {
            // If the message is text, display it normally
            li.textContent = `${data.user.name}: ${data.message}`;
        }

        li.classList.add(data.user.id === currentUserId ? "my-message" : "other-message");
        chatList.appendChild(li);
        chatList.scrollTop = chatList.scrollHeight; // Scroll to the bottom
    }
});
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

        alert("Group created successfully"); // Show success message
        document.getElementById("groupName").value = ""; // Clear the input field
        await fetchGroups(); // Refresh the group list
    } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group. Please try again.");
    }
};

// Function to search for users
const searchUsersHandler = async (event) => {
    event.preventDefault();

    const query = document.getElementById("searchQuery").value.trim();

    if (!query) {
        alert("Search query cannot be empty!");
        return;
    }

    try {
        const response = await axios.get(`${baseurl}/user/search`, {
            params: { query },
            headers: { Authorization: `Bearer ${token}` },
        });

        const users = response.data.users;
        const searchResults = document.getElementById("searchResults");
        searchResults.innerHTML = ""; // Clear previous results

        if (users.length === 0) {
            searchResults.innerHTML = "<p>No users found.</p>";
            return;
        }

        users.forEach((user) => {
            const userItem = document.createElement("div");
            userItem.classList.add("user-item");
            userItem.innerHTML = `
                <span>${user.name} (${user.email})</span>
                <button onclick="addUserToGroup('${user.email}')">Add</button>
            `;
            searchResults.appendChild(userItem);
        });
    } catch (error) {
        console.error("Error searching for users:", error);
        alert("Failed to search for users. Please try again.");
    }
};

// Function to add a user to the group
const addUserToGroup = async (email) => {
    if (!selectedGroupId) {
        alert("Please select a group to add a user!");
        return;
    }

    try {
        const response = await axios.post(
            `${baseurl}/groups/addUser`,
            { groupId: selectedGroupId, email },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data.status); // Show success message
        await getGroupMembers(selectedGroupId); // Refresh group members
    } catch (error) {
        console.error("Error adding user to group:", error);
        alert(error.response?.data?.error || "Failed to add user. Please try again.");
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
            return;
        }

        groups.forEach((group, index) => {
            const li = document.createElement("li");
            li.classList.add("group-item");
            li.innerHTML = `
                <span>${group.name}</span>
                <ul id="group-${group.id}-members" class="member-list">
                    <!-- Group members will be dynamically added here -->
                </ul>
            `;
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
const selectGroup = async (groupId, groupElement) => {
    if (selectedGroupId === groupId) return;

    selectedGroupId = groupId;

    const groupItems = document.querySelectorAll(".group-item");
    groupItems.forEach((item) => item.classList.remove("selected-group"));
    groupElement.classList.add("selected-group");

    // Join the group room via Socket.IO
    socket.emit("joinGroup", groupId);

    await getGroupMembers(groupId); // Fetch and display group members
    await getChatHandler(groupId); // Fetch and display chats
};

// Function to fetch and display group members
const getGroupMembers = async (groupId) => {
    try {
        const response = await axios.get(`${baseurl}/groups/getGroupUsers/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const members = response.data.users;
        const currentUserId = response.data.currentUserId; // Get the current user's ID
        isAdmin = await axios.get(`${baseurl}/groups/isAdmin/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.data.isAdmin); // Check if the current user is an admin

        const memberList = document.getElementById(`group-${groupId}-members`);
        memberList.innerHTML = ""; // Clear existing members

        // Filter out the current user
        const filteredMembers = members.filter((member) => member.id !== currentUserId);

        // Display the filtered members
        filteredMembers.forEach((member) => {
            const memberItem = document.createElement("li");
            memberItem.classList.add("member-item");
            memberItem.innerHTML = `
                <span>${member.name} (${member.email})</span>
                ${
                    isAdmin
                        ? `
                    <button onclick="removeUserFromGroup(${member.id})" class="remove-btn">-</button>
                    ${
                        !member.isAdmin
                            ? `<button onclick="promoteToAdmin(${member.id})" class="promote-btn">+</button>`
                            : ""
                    }
                `
                        : ""
                }
            `;
            memberList.appendChild(memberItem);
        });
    } catch (error) {
        console.error("Error fetching group members:", error);
        alert("Failed to load group members. Please try again.");
    }
};

// Function to remove a user from the group
const removeUserFromGroup = async (userId) => {
    try {
        const response = await axios.post(
            `${baseurl}/groups/removeUser`,
            { groupId: selectedGroupId, userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data.status); // Show success message
        await getGroupMembers(selectedGroupId); // Refresh group members
    } catch (error) {
        console.error("Error removing user from group:", error);
        alert("Failed to remove user. Please try again.");
    }
};

// Function to promote a user to admin
const promoteToAdmin = async (userId) => {
    try {
        const response = await axios.post(
            `${baseurl}/groups/makeAdmin`,
            { groupId: selectedGroupId, userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data.status); // Show success message
        await getGroupMembers(selectedGroupId); // Refresh group members
    } catch (error) {
        console.error("Error promoting user to admin:", error);
        alert("Failed to promote user. Please try again.");
    }
};

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
    fetchGroups();
});