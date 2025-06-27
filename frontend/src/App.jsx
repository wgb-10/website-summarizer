import React, { useState } from 'react';

function App() {
	const [url, setUrl] = useState('');
	const [summary, setSummary] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch('http://localhost:5000/api/summarize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url }),
			});
			const data = await response.json();
			setSummary(data.summary);
		} catch (error) {
			console.error('Error summarizing:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="App">
			<h1>Webpage Summarizer</h1>
			<form onSubmit={handleSubmit}>
				<input type="url" placeholder="Enter webpage URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
				<button type="submit" disabled={loading}>
					{loading ? 'Summarizing...' : 'Summarize'}
				</button>
			</form>
			{summary && (
				<div>
					<h2>Summary</h2>
					<p>{summary}</p>
				</div>
			)}
		</div>
	);
}

export default App;
