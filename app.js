const drawButton = document.querySelector('#drawButton');
const buttonLabel = document.querySelector('#buttonLabel');
const songCount = document.querySelector('#songCount');
const songList = document.querySelector('#songList');
const statusMessage = document.querySelector('#statusMessage');

let songs = [];

// CSV의 따옴표, 쉼표, 줄바꿈, 이스케이프된 따옴표를 처리한다.
function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function randomIndex(limit) {
  if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * limit);

  const buffer = new Uint32Array(1);
  const range = 0x100000000;
  const cutoff = range - (range % limit);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= cutoff);
  return buffer[0] % limit;
}

function pickThree(items) {
  const pool = [...items];
  const picked = [];
  for (let i = 0; i < 3; i += 1) {
    const index = randomIndex(pool.length);
    picked.push(pool[index]);
    pool[index] = pool[pool.length - 1];
    pool.pop();
  }
  return picked;
}

function renderSongs(picked) {
  const cards = songList.querySelectorAll('.song-card');
  picked.forEach((song, index) => {
    const title = cards[index].querySelector('.song-title');
    title.textContent = song;
    title.classList.remove('placeholder');
  });
}

drawButton.addEventListener('click', () => {
  renderSongs(pickThree(songs));
  buttonLabel.textContent = '다시 뽑기';
  statusMessage.textContent = '새로운 3곡을 뽑았어요.';
});

async function loadSongs() {
  try {
    const response = await fetch('./song.csv');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCsv((await response.text()).replace(/^\uFEFF/, ''));
    const titleIndex = rows[0]?.indexOf('곡명') ?? -1;
    if (titleIndex < 0) throw new Error('곡명 열을 찾을 수 없습니다.');

    songs = rows.slice(1).map((row) => row[titleIndex]?.trim()).filter(Boolean);
    if (songs.length < 3) throw new Error('곡이 3개보다 적습니다.');

    songCount.textContent = `전체 ${songs.length}곡`;
    buttonLabel.textContent = '랜덤 3곡 뽑기';
    statusMessage.textContent = '준비됐어요. 버튼을 눌러 시작하세요.';
    drawButton.disabled = false;
  } catch (error) {
    songCount.textContent = '불러오기 실패';
    buttonLabel.textContent = '곡 목록을 확인해 주세요';
    statusMessage.textContent = '곡 목록을 불러오지 못했어요. 페이지를 새로고침해 주세요.';
    statusMessage.classList.add('error');
    console.error('song.csv를 불러오지 못했습니다:', error);
  }
}

loadSongs();
