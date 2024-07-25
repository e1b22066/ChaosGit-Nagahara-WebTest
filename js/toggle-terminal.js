document.addEventListener('DOMContentLoaded', () => {
    const toggleTerminalButton = document.getElementById('toggle-terminal-button');
    const terminalContainer = document.getElementById('terminal');

    toggleTerminalButton.addEventListener('click', () => {
        if (terminalContainer.style.display === 'none') {
            terminalContainer.style.display = 'block';
            toggleTerminalButton.textContent = 'Hide Terminal';
            initializeTerminal();
        } else {
            closeTerminal();
            terminalContainer.style.display = 'none';
            toggleTerminalButton.textContent = 'Show Terminal';
        }
    });
});
