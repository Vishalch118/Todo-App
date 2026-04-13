const API_BASE = "https://todo-backend-o4pf.onrender.com/api";
const token = localStorage.getItem("token");

function goBack() {
    window.location.href = "/";
}

async function buyPlan(plan) {
    try {
        const res = await fetch(`${API_BASE}/payment/create-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ plan })
        });

        const order = await res.json();

        const options = {
            key: "YOUR_RAZORPAY_KEY_ID", // 🔴 replace
            amount: order.amount,
            currency: "INR",
            name: "TODO App",
            description: "Buy Credits",
            order_id: order.id,

            handler: async function () {
                await fetch(`${API_BASE}/payment/verify-payment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ plan })
                });

                alert("Payment successful! Credits added.");
                window.location.href = "/";
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        alert("Payment failed");
    }
}