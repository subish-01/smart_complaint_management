const form = document.getElementById("complaintForm");
const message = document.getElementById("message");
const tableBody = document.querySelector("#complaintTable tbody");

let complaints = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;
  const description = document.getElementById("description").value;

  const complaint = {
    id: complaints.length + 1,
    name,
    email,
    category,
    location,
    description,
    status: "Pending"
  };

  complaints.push(complaint);
  displayComplaints();
  message.textContent = "✅ Complaint submitted successfully!";
  form.reset();
  setTimeout(() => (message.textContent = ""), 3000);
});

function displayComplaints() {
  tableBody.innerHTML = "";
  complaints.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.category}</td>
      <td>${c.location}</td>
      <td>${c.status}</td>
    `;
    tableBody.appendChild(row);
  });
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}
