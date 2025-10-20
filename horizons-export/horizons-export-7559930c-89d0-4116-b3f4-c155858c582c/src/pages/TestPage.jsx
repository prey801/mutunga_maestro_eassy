function TestPage() {
  return (
    <div>
      <h1>TEST PAGE WORKS!</h1>
      <p>If you can see this, React routing is working.</p>
      <p>Current time: {new Date().toString()}</p>
      <div style={{background: 'red', padding: '20px', color: 'white'}}>
        RED BACKGROUND - This should be visible
      </div>
    </div>
  );
}

export default TestPage;