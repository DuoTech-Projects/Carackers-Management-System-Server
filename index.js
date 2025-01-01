const express = require("express");
const app = express();
const cors = require("cors");

const { dbConnection } = require("./db-connection");
const Admin = require("./schema/user-schema"); // Import Admin model

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies
const port = 3001;

// Route to fetch all users for a specific admin
app.get("/api/users/:adminName", async (req, res) => {
  const { adminName } = req.params;
  try {
    const admin = await Admin.findOne({ admin: adminName });
    if (admin) {
      res.json(admin.clients); // Send the array of users for the admin
    } else {
      res.status(404).send("Admin not found");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

// Route to add a new user for a specific admin
app.post("/api/users", async (req, res) => {
  const { admin, name, phoneNumber, place, month, date, amount } = req.body;

  if (!admin || !name || !phoneNumber || !place || !date || !amount) {
    return res.status(400).send("Invalid request data");
  }

  try {
    // Find the admin and add the user to the admin's clients array
    const adminDoc = await Admin.findOne({ admin });
    if (!adminDoc) {
      // If admin doesn't exist, create a new admin and add the user
      const newAdmin = new Admin({
        admin,
        clients: [{ name, phoneNumber, place, month, date, amount }],
      });
      await newAdmin.save();
      res.status(201).json({ message: "Admin and user added successfully", newAdmin });
    } else {
      // If admin exists, add the user to the admin's clients array
      adminDoc.clients.push({ name, phoneNumber, place, month, date, amount });
      await adminDoc.save();
      res.status(201).json({ message: "User added successfully", adminDoc });
    }
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Error adding user");
  }
});

// Route to update a user under a specific admin
app.put("/api/users/:adminName/:userId", async (req, res) => {
  const { adminName, userId } = req.params;
  const updates = req.body;

  try {
    const admin = await Admin.findOne({ admin: adminName });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Find the user within the admin's clients array and update it
    const userIndex = admin.clients.findIndex((user) => user._id.toString() === userId);
    if (userIndex !== -1) {
      admin.clients[userIndex] = { ...admin.clients[userIndex], ...updates }; // Merge updates
      await admin.save();
      return res.json({ message: "User updated successfully", updatedUser: admin.clients[userIndex] });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route to delete a user under a specific admin
app.delete("/api/users/:adminName/:userId", async (req, res) => {
  const { adminName, userId } = req.params;

  try {
    const admin = await Admin.findOne({ admin: adminName });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Find the user and remove them from the clients array
    const userIndex = admin.clients.findIndex((user) => user._id.toString() === userId);
    if (userIndex !== -1) {
      const deletedUser = admin.clients.splice(userIndex, 1); // Remove the user from the array
      await admin.save();
      return res.json({ message: "User deleted successfully", deletedUser });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Start the server
dbConnection()
  .then(async (message) => {
    app.listen(port, () => {
      console.log(`${message}\nServer running on Port : ${port}`);
    });
  })
  .catch((err) => console.log(err));
