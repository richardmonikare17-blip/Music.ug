const form = document.getElementById('postForm');
const feed = document.getElementById('postFeed');
const musicList = document.getElementById('musicList');
const STORAGE_KEY = 'beatbridge-demo-posts';

document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});
document.querySelectorAll('#mainNav a').forEach(link => link.addEventListener('click', () => {
  document.getElementById('mainNav').classList.remove('open');
}));

function getPosts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (_) { return []; }
}
function savePosts(posts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
  catch (_) { alert('This file may be too large for browser storage. Try a smaller file.'); }
}
function safeText(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
}
function renderPosts() {
  const posts = getPosts();
  feed.innerHTML = '';
  if (!posts.length) {
    feed.innerHTML = '<div class="empty-state"><span>♫</span><h3>Your next post starts here</h3><p>Share a new release, poster or artist update using the form.</p></div>';
    return;
  }
  posts.slice().reverse().forEach(post => {
    const article = document.createElement('article');
    article.className = 'feed-post';
    const media = post.fileData
      ? (post.fileType.startsWith('image/')
          ? `<img src="${post.fileData}" alt="Uploaded poster or artwork">`
          : post.fileType.startsWith('audio/')
            ? `<audio controls src="${post.fileData}"></audio>` : '')
      : '';
    const link = post.link ? `<p><a href="${safeText(post.link)}" target="_blank" rel="noopener">Open song / social link ↗</a></p>` : '';
    article.innerHTML = `<div class="feed-post-head"><div><div class="feed-meta">${safeText(post.type.toUpperCase())} · ${safeText(post.date)}</div><h4>${safeText(post.title)}</h4></div></div><p><b>${safeText(post.artist)}</b>${post.description ? ' — ' + safeText(post.description) : ''}</p>${link}${media}`;
    feed.appendChild(article);
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const file = document.getElementById('postFile').files[0];
  const submitPost = fileData => {
    const post = {
      type: document.getElementById('postType').value,
      artist: document.getElementById('artistName').value.trim(),
      title: document.getElementById('postTitle').value.trim(),
      description: document.getElementById('postDescription').value.trim(),
      link: document.getElementById('postLink').value.trim(),
      fileData: fileData || '',
      fileType: file ? file.type : '',
      date: new Date().toLocaleDateString()
    };
    const posts = getPosts();
    posts.push(post);
    savePosts(posts);
    renderPosts();
    if (post.type === 'Song') {
      const row = document.createElement('div');
      row.className = 'music-row';
      row.innerHTML = `<div class="track-cover cover-a">♫</div><div class="track-info"><h3>${safeText(post.title)}</h3><p>${safeText(post.artist)} · New submission</p></div><span class="track-label">NEW</span>`;
      musicList.prepend(row);
    }
    form.reset();
    document.getElementById('postFeed').scrollIntoView({behavior:'smooth', block:'nearest'});
  };
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('For this browser-only demo, please use a file smaller than 2 MB. A real website should upload media to a server.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => submitPost(reader.result);
    reader.readAsDataURL(file);
  } else submitPost('');
});
document.getElementById('clearPosts').addEventListener('click', () => {
  if (confirm('Clear all posts saved in this browser?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderPosts();
  }
});
renderPosts();
