const balance = document.querySelector("#balance");
const inc_amt = document.querySelector("#inc-amt");
const exp_amt = document.querySelector("#exp-amt");
const trans = document.querySelector("#trans");
const form = document.querySelector("#form");
const description = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const localStorageTrans = JSON.parse(localStorage.getItem("trans"));

let transactions = localStorage.getItem("trans") !== null ? localStorageTrans : [];

function loadTransactionDetails(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "exp" : "inc");
  item.innerHTML = `
    ${transaction.description}
    <span>${sign} ${Math.abs(transaction.amount)}</span>
    <button class="btn-del" onclick="removeTrans(${transaction.id})">x</button>
  `;
  trans.appendChild(item);
}

function removeTrans(id) {
  if (confirm("Are you sure you want to delete Transaction?")) {
    transactions = transactions.filter((transaction) => transaction.id != id);
    updateLocalStorage();
    config();
  }
}

function updateAmount() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  balance.innerHTML = `₹ ${total}`;

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);
  inc_amt.innerHTML = `₹ ${income}`;

  const expense = amounts
    .filter((item) => item < 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);
  exp_amt.innerHTML = `₹ ${Math.abs(expense)}`;

  // Check if expense exceeds limit and trigger alert
  const spendingLimit = 15000; // Set your desired limit
  if (Math.abs(expense) > spendingLimit) {
    alert(`Warning: You have exceeded your spending limit of ₹${spendingLimit}!`);
  }
}
function generateExpenseChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const monthlyExpenses = new Array(12).fill(0); // Initialize all months to 0

  transactions.forEach(transaction => {
    let transMonth = new Date(transaction.date + "-01").getMonth();
    monthlyExpenses[transMonth] += transaction.amount < 0 ? Math.abs(transaction.amount) : 0;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Monthly Expenses (₹)",
        data: monthlyExpenses,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)", 
          "rgba(54, 162, 235, 0.7)", 
          "rgba(255, 206, 86, 0.7)"
        ],
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.7)", bodyColor: "white" }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "#ddd" } },
        x: { grid: { color: "#ddd" } }
      }
    }
  });
}

function config() {
  trans.innerHTML = "";
  transactions.forEach(loadTransactionDetails);
  updateAmount();
  calculateMonthlyDifference();
  generateExpenseChart(); // Call the chart function
}



function addTransaction(e) {
  e.preventDefault();
  if (description.value.trim() === "" || amount.value.trim() === "") {
    alert("Please enter description and amount");
  } else {
    const transaction = {
  id: uniqueId(),
  description: description.value,
  amount: +amount.value,
  date: new Date().toISOString().slice(0, 7), // Stores month in "YYYY-MM" format
};

    transactions.push(transaction);
    loadTransactionDetails(transaction);
    description.value = "";
    amount.value = "";
    updateAmount();
    updateLocalStorage();
  }
}

function uniqueId() {
  return Math.floor(Math.random() * 10000000);
}

form.addEventListener("submit", addTransaction);
window.addEventListener("load", config);

function updateLocalStorage() {
  localStorage.setItem("trans", JSON.stringify(transactions));
}
function calculateMonthlyDifference() {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .slice(0, 7);

  const currentTransactions = transactions.filter(trans => trans.date === currentMonth);
  const previousTransactions = transactions.filter(trans => trans.date === previousMonth);

  const currentTotal = currentTransactions.reduce((acc, trans) => acc + trans.amount, 0);
  const previousTotal = previousTransactions.reduce((acc, trans) => acc + trans.amount, 0);

  const difference = currentTotal - previousTotal;

  const message = difference > 0 
    ? `Your balance increased by ₹${Math.abs(difference)} compared to last month!` 
    : `Your balance decreased by ₹${Math.abs(difference)} compared to last month!`;

  alert(message);
}


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Signup function
document.getElementById("signup-btn").addEventListener("click", function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signup successful!");
      checkAuthState(); // Ensure UI updates
    })
    .catch(error => alert(error.message));
});

// Login function
function login(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "index.html"; // Redirect to dashboard after login
    })
    .catch(error => alert(error.message));
}


// Logout function
document.getElementById("logout-btn").addEventListener("click", function () {
  auth.signOut()
    .then(() => {
      alert("Logged out successfully!");
      checkAuthState(); // Ensure UI updates
    })
    .catch(error => alert(error.message));
});



