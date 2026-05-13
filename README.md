# ⚡ NLP-to-SQL Query Engine

An AI-powered tool that converts plain English questions into SQL queries for an e-commerce database — built with React and Claude AI.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![AI](https://img.shields.io/badge/Claude_AI-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 📌 Overview

The **NLP-to-SQL Query Engine** lets anyone query an e-commerce database using plain English — no SQL knowledge required. Type a question, and the AI instantly generates the correct SQL query, explains it, and shows a sample result preview.

> Built as part of a portfolio project showcasing skills in Generative AI, SQL, NLP, and full-stack development.

---

## ✨ Features

- 💬 **Natural Language Input** — Ask questions in plain English
- ⚡ **Instant SQL Generation** — AI writes the exact SQL query
- 📖 **Query Explanation** — One-line summary of what the query does
- 📊 **Results Preview** — Sample data table for every query
- 🗄️ **Schema Sidebar** — Visual overview of all tables and columns
- 🕐 **Query History** — Last 5 queries saved for quick access
- 🔄 **Multi-dialect** — Supports PostgreSQL, BigQuery, Snowflake

---

## 🗄️ Database Schema

| Table | Columns |
|---|---|
| 👤 customers | id, name, email, country, signup_date, tier |
| 🛒 orders | id, customer_id, order_date, total, status, shipping_days |
| 📦 products | id, name, category, price, stock, rating |
| 🧾 order_items | id, order_id, product_id, quantity, unit_price |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Hooks) |
| AI Model | Anthropic Claude (claude-sonnet) |
| Styling | Inline CSS + Inter + JetBrains Mono |
| API | Anthropic Messages API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- An Anthropic API key → [Get one here](https://console.anthropic.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/trishukadaram/nlp-to-sql.git

# Navigate into the project
cd nlp-to-sql

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

---

## 💻 Usage

1. **Type a question** in plain English (e.g. *"Show me top 5 customers by total spending"*)
2. Press **Enter** or click **Generate SQL →**
3. View the generated SQL query with syntax highlighting
4. Read the explanation of what the query does
5. See a sample results preview below

### Example Questions

```
"Show me top 5 customers by total spending"
"Which products have low stock under 10 units?"
"What is the average order value by country?"
"List all pending orders from last 30 days"
"Which product category has the highest revenue?"
"Find customers who haven't ordered in 90 days"
```

---

## 📁 Project Structure

```
nlp-to-sql/
├── src/
│   └── NLPtoSQL.jsx        # Main application component
├── public/
├── .env                    # API key (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 📸 Screenshots

> *Add screenshots of your app here after running it locally*

---

## 🔮 Future Enhancements

- [ ] Connect to a live PostgreSQL or BigQuery database
- [ ] Execute queries and return real results
- [ ] Export queries as .sql files
- [ ] Support custom schema uploads
- [ ] Add query validation and error detection

---

## 👩‍💻 Author

**Trisheela Kadaram**
Business Data Analyst | SQL · Python · Power BI · BigQuery · Generative AI
📧 trishukadaram@gmail.com
🔗 [LinkedIn](https://linkedin.com/in/YOUR_LINKEDIN)
🐙 [GitHub](https://github.com/trishukadaram)

---

## 📄 License

This project is licensed under the MIT License.
