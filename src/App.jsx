import { useState } from 'react'
import './App.css'

const categories = ['餐飲', '交通', '購物', '薪資', '其他']
const money = new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 2 })
function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function App() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '餐飲', date: today(), note: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const month = today().slice(0, 7)
  const monthly = transactions.filter((item) => item.date.slice(0, 7) === month)
  // 金額以「分」儲存，減少小數加總的浮點誤差。
  const income = monthly.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.cents, 0)
  const expense = monthly.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.cents, 0)
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  function updateForm(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setError('')
    setMessage('')
  }
  function addTransaction(event) {
    event.preventDefault()
    const amount = Number(form.amount)
    const cents = Math.round(amount * 100)
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(cents) || cents <= 0 || !form.date) {
      setError('請輸入大於 0 的有效金額，並選擇日期。')
      return
    }
    setTransactions((previous) => [{ ...form, note: form.note.trim(), cents, id: crypto.randomUUID() }, ...previous])
    setForm((previous) => ({ ...previous, amount: '', note: '' }))
    setError('')
    setMessage('已新增一筆交易。')
  }
  function deleteTransaction(item) {
    if (window.confirm(`確定刪除 ${item.date} 的${item.category}交易 ${money.format(item.cents / 100)}？`)) {
      setTransactions((previous) => previous.filter((transaction) => transaction.id !== item.id))
      setMessage('已刪除交易。')
    }
  }

  return (
    <main className="app" lang="zh-Hant">
      <header><div className="brand"><span className="brand-icon" aria-hidden="true">＄</span><div>My Money Tracker<small>個人記帳與支出分析</small></div></div><span className="badge">我的記帳本</span></header>
      <section className="intro"><div><p className="eyebrow">每一筆，都更清楚</p><h1>掌握日常，理好生活。</h1><p>從今天的一筆記錄開始，慢慢累積理想生活。</p></div><div className="month">統計月份<strong>{month.replace('-', ' 年 ')} 月</strong></div></section>
      <section className="stats" aria-label="本月收支統計">
        {[
          { label: '本月收入', value: income, style: 'income', icon: '↙', hint: '這個月的收入總額' },
          { label: '本月支出', value: expense, style: 'expense', icon: '↗', hint: '這個月的支出總額' },
          { label: '本月結餘', value: income - expense, style: 'balance', icon: '=', hint: '收入減去支出' },
        ].map((stat) => <article className={`stat ${stat.style}`} key={stat.label}><div className="stat-top"><h2>{stat.label}</h2><span aria-hidden="true">{stat.icon}</span></div><strong>{money.format(stat.value / 100)}</strong><p>{stat.hint}</p></article>)}
      </section>
      <div className="workspace">
        <section className="panel form-panel" aria-labelledby="form-title"><h2 id="form-title">新增交易</h2><p className="subtitle">記下這一筆，收支更有方向。</p>
          <form onSubmit={addTransaction}>
            <fieldset><legend>交易類型</legend><div className="type-options">{[['expense', '支出'], ['income', '收入']].map(([value, label]) => <label className={form.type === value ? 'selected' : ''} key={value}><input type="radio" name="type" value={value} checked={form.type === value} onChange={updateForm} />{label}</label>)}</div></fieldset>
            <label htmlFor="amount">金額 <small>新臺幣 TWD</small></label><input id="amount" name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" required placeholder="0.00" value={form.amount} onChange={updateForm} />
            <div className="form-row"><div><label htmlFor="category">分類</label><select id="category" name="category" value={form.category} onChange={updateForm}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div><label htmlFor="date">日期</label><input id="date" name="date" type="date" required value={form.date} onChange={updateForm} /></div></div>
            <label htmlFor="note">備註 <small>選填</small></label><textarea id="note" name="note" rows="3" maxLength="300" placeholder="這筆交易的小細節…" value={form.note} onChange={updateForm} />
            {error && <p className="error" role="alert">{error}</p>}<button className="submit" type="submit">＋ 新增交易</button>
          </form><p className="memory-note">資料僅暫存於記憶體，重新整理後會清除。</p>
        </section>
        <section className="panel records" aria-labelledby="records-title"><div className="records-heading"><h2 id="records-title">交易紀錄 <span className="count">{transactions.length} 筆</span></h2><p className="subtitle">所有日期的紀錄，依日期由新到舊排列。</p></div><p className="status" role="status">{message}</p>
          {transactions.length === 0 ? <div className="empty"><span aria-hidden="true">▤</span><h3>你的第一筆，從這裡開始</h3><p>新增一筆收入或支出，<br />讓每一筆金錢流向都有跡可循。</p></div> : <div className="table-scroll"><table><caption className="sr-only">所有交易紀錄</caption><thead><tr>{['日期', '類型', '分類', '金額', '備註', '操作'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{sorted.map((item) => <tr key={item.id}><td>{item.date}</td><td><span className={`type-badge ${item.type}`}>{item.type === 'income' ? '收入' : '支出'}</span></td><td>{item.category}</td><td className={`amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{money.format(item.cents / 100)}</td><td className="note">{item.note || '—'}</td><td><button className="delete" type="button" aria-label={`刪除 ${item.date} ${item.category} ${money.format(item.cents / 100)} 的交易`} onClick={() => deleteTransaction(item)}>刪除</button></td></tr>)}</tbody></table></div>}
        </section>
      </div><footer>簡單記帳，讓生活多一點餘裕。<span>金額以新臺幣（TWD）顯示</span></footer>
    </main>
  )
}
export default App
