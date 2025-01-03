// user-management.js

let users = []; // This will store users temporarily in memory

// Function to add a user to the users array
function addUser(user) {
    // Check if the user already exists (optional)
    if (!users.some(existingUser => existingUser.id === user.id)) {
        users.push(user);
        console.log(`User ${user.display_name} added.`);
    } else {
        console.log(`User ${user.display_name} already exists.`);
    }
}

// Function to get all users
function getUsers() {
    return users;
}

// Optionally, you can also implement a way to remove or update users.
// function removeUser(userId) {
//     users = users.filter(user => user.id !== userId);
// }

// function updateUser(userId, updatedData) {
//     const userIndex = users.findIndex(user => user.id === userId);
//     if (userIndex !== -1) {
//         users[userIndex] = { ...users[userIndex], ...updatedData };
//     }
// }

module.exports = {
    addUser,
    getUsers
};
