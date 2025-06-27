import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
	const [url, setUrl] = useState('');
	const [summary, setSummary] = useState('');
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({ show: false, message: '' });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setSummary(''); // Clear previous summary
		try {
			const response = await fetch('http://localhost:5000/api/summarize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url }),
			});
			const data = await response.json();
			if (response.ok) {
				setSummary(data.summary);
			} else {
				setSummary(`Error: ${data.error || 'Something went wrong.'}`);
			}
		} catch (error) {
			console.error('Error summarizing:', error);
			setSummary('Error: Could not connect to the summarization service.');
		} finally {
			setLoading(false);
		}
	};

	const showSnackbar = (message) => {
		setSnackbar({ show: true, message });
		setTimeout(() => {
			setSnackbar({ show: false, message: '' });
		}, 3000); // Hide after 3 seconds
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(summary).then(() => {
			showSnackbar('Summary copied to clipboard!');
		}).catch(err => {
			console.error('Failed to copy: ', err);
			showSnackbar('Failed to copy summary.');
		});
	};

	return (
		<div className="App">
			<div className="container">
				<h1>Webpage Summarizer</h1>
				<form onSubmit={handleSubmit}>
					<input type="url" placeholder="Enter webpage URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
					<button type="submit" disabled={loading}>
						{loading ? 'Summarizing...' : 'Summarize'}
					</button>
				</form>

				{loading && <div className="loading-indicator">Loading...</div>}

				{summary && (
					<div className="summary-section">
						<h2>Summary</h2>
						<ReactMarkdown>{summary}</ReactMarkdown>
						<button onClick={copyToClipboard} className="copy-button">
							Copy to Clipboard
						</button>
					</div>
				)}
			</div>
			{snackbar.show && (
				<div className="snackbar show">
					{snackbar.message}
				</div>
			)}
		</div>
	);
}

export default App;
