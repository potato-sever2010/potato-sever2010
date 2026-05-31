// 自动从 1.txt 加载项目列表
async function loadProjectList() {
    try {
        const response = await fetch('1.txt');
        if (!response.ok) {
            throw new Error('无法加载文件列表');
        }

        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');

        const fileList = document.getElementById('fileList');

        // 清除现有内容（保留表头）
        const header = fileList.querySelector('.file-list-header');
        fileList.innerHTML = '';
        if (header) {
            fileList.appendChild(header);
        }

        lines.forEach(line => {
            const parts = line.split('|');
            if (parts.length < 4) return;

            const [name, url, type, size, date] = parts;

            const fileItem = document.createElement('a');
            fileItem.href = url;
            fileItem.target = '_blank';
            fileItem.className = 'file-item';

            // 根据类型选择图标
            let icon = 'fa-file';
            if (type === '目录' || name.endsWith('/')) {
                icon = 'fa-folder';
            } else if (name.endsWith('.zip') || name.endsWith('.rar')) {
                icon = 'fa-file-archive';
            } else if (name.endsWith('.md')) {
                icon = 'fa-file-alt';
            }

            // 添加返回上级链接
            if (name === 'Parent directory' || name === '返回上级') {
                icon = 'fa-arrow-up';
            }

            fileItem.innerHTML = `
                <div class="file-name">
                    <i class="fas ${icon}"></i>
                    ${name}${type === '目录' && !name.endsWith('/') ? '/' : ''}
                </div>
                <div class="file-size">${size || '-'}</div>
                <div class="file-date">${date || '-'}</div>
            `;

            fileList.appendChild(fileItem);
        });

        // 更新加载时间显示
        updateLoadTime();

    } catch (error) {
        console.error('加载项目列表失败:', error);
        const fileList = document.getElementById('fileList');
        const header = fileList.querySelector('.file-list-header');
        fileList.innerHTML = '';
        if (header) {
            fileList.appendChild(header);
        }
        fileList.innerHTML += `
            <div style="padding: 2rem; text-align: center; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle"></i>
                加载文件列表失败，请检查 1.txt 文件是否存在
            </div>
        `;
    }
}

// 显示最后加载时间
function updateLoadTime() {
    let timeDisplay = document.getElementById('loadTime');
    if (!timeDisplay) {
        timeDisplay = document.createElement('div');
        timeDisplay.id = 'loadTime';
        timeDisplay.style.cssText = 'text-align: center; color: #888; font-size: 0.9rem; margin-top: 1rem;';

        const h1 = document.querySelector('.project-page h1');
        if (h1) {
            h1.parentNode.insertBefore(timeDisplay, h1.nextSibling);
        }
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    timeDisplay.innerHTML = `<i class="fas fa-sync-alt"></i> 最后更新: ${timeString} (每60秒自动刷新)`;
}

// 初始加载
document.addEventListener('DOMContentLoaded', () => {
    loadProjectList();

    // 每隔 60 秒（1分钟）自动重新加载
    setInterval(loadProjectList, 60000);

    console.log('项目列表已启动，每60秒自动刷新一次');
});
