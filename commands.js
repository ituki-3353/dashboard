/**
 * DashBD Command Shell Processor
 */
const DashShell = {
    execute: (cmd, args, context) => {
        const { output, body, input, updateTaskbar, openWindow } = context;

        switch (cmd) {
            case 'help':
                output.innerHTML += `<div>Available commands: HELP, CLS, VER, DIR, ECHO, EXIT, COLOR, OPEN</div>`;
                break;
            case 'cls':
                output.innerHTML = '';
                break;
            case 'ver':
                output.innerHTML += `<div>DashBD Version 1.0.1998 [Version 4.10.1998]</div>`;
                break;
            case 'echo':
                output.innerHTML += `<div>${args.join(' ')}</div>`;
                break;
            case 'dir':
                output.innerHTML += `<div> Volume in drive C is DASHBD\n Volume Serial Number is 1998-0625\n\n Directory of C:\\DASHBOARD\n\n`;
                const files = [
                    { name: 'CONFIG   JS', size: '1,432', date: '05-01-26' },
                    { name: 'INDEX    HTM', size: '10,248', date: '05-01-26' },
                    { name: 'STYLE    CSS', size: '12,564', date: '05-01-26' },
                    { name: 'MAIN     JS', size: '14,290', date: '05-01-26' },
                    { name: 'COMMANDS JS', size: '2,048', date: '05-01-26' },
                    { name: 'PROGRAMS', size: '<DIR>', date: '05-01-26' }
                ];
                files.forEach(f => {
                    output.innerHTML += `${f.name.padEnd(12)} ${f.size.padStart(10)}  ${f.date}\n`;
                });
                output.innerHTML += `\n       5 file(s)     40,582 bytes\n       1 dir(s)      1,048,576 bytes free</div>`;
                break;
            case 'open':
                if (args[0]) {
                    const appName = args[0].toLowerCase();
                    const windowId = appName.endsWith('-window') ? appName : `${appName}-window`;
                    if (document.getElementById(windowId)) {
                        openWindow(windowId);
                        output.innerHTML += `<div>Opening ${appName}...</div>`;
                    } else {
                        output.innerHTML += `<div>Bad command or file name: ${args[0]}</div>`;
                    }
                } else {
                    output.innerHTML += `<div>Usage: OPEN [filename]</div>`;
                }
                break;
            case 'exit':
                const win = document.getElementById('command-window');
                if (win) win.classList.add('window-hidden');
                updateTaskbar();
                break;
            case 'color':
                if (args[0] === 'a') {
                    body.style.color = '#00ff00';
                    input.style.color = '#00ff00';
                } else {
                    body.style.color = '#ffffff';
                    input.style.color = '#ffffff';
                }
                break;
            default:
                output.innerHTML += `<div>Bad command or file name</div>`;
        }
    }
};