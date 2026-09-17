const drawButton = document.querySelector('#drawButton');
const buttonLabel = document.querySelector('#buttonLabel');
const songCount = document.querySelector('#songCount');
const songList = document.querySelector('#songList');
const statusMessage = document.querySelector('#statusMessage');

let songs = [];
let rivalScores = new Map();

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

function scoreChip(score, label, className = '') {
  const chip = document.createElement('span');
  chip.className = `score-chip ${className}`.trim();
  if (label) {
    const caption = document.createElement('span');
    caption.className = 'score-chip-label';
    caption.textContent = label;
    chip.append(caption);
  }
  const value = document.createElement('span');
  value.textContent = score.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  chip.append(value);
  return chip;
}

function renderSongs(picked) {
  const cards = songList.querySelectorAll('.song-card');
  picked.forEach((song, index) => {
    const title = cards[index].querySelector('.song-title');
    title.textContent = song;
    title.classList.remove('placeholder');

    const values = cards[index].querySelector('.score-values');
    const scores = rivalScores.get(song);
    values.classList.remove('placeholder');
    if (!scores) {
      values.replaceChildren(scoreChip('0', '', 'empty'));
    } else if (scores.second === '0') {
      values.replaceChildren(scoreChip(scores.first, '첫 번째'));
    } else {
      values.replaceChildren(
        scoreChip(scores.first, '첫 번째'),
        scoreChip(scores.second, '두 번째', 'secondary'),
      );
    }
  });
}

drawButton.addEventListener('click', () => {
  renderSongs(pickThree(songs));
  buttonLabel.textContent = '다시 뽑기';
  statusMessage.textContent = '새로운 3곡을 뽑았어요.';
});

async function loadSongs() {
  try {
    const [songResponse, rivalResponse] = await Promise.all([
      fetch('./song.csv'),
      fetch('./rival.csv'),
    ]);
    if (!songResponse.ok || !rivalResponse.ok) throw new Error('CSV 파일을 불러오지 못했습니다.');

    const songRows = parseCsv((await songResponse.text()).replace(/^\uFEFF/, ''));
    const rivalRows = parseCsv((await rivalResponse.text()).replace(/^\uFEFF/, ''));
    const songTitleIndex = songRows[0]?.indexOf('곡명') ?? -1;
    const rivalTitleIndex = rivalRows[0]?.indexOf('곡명') ?? -1;
    const firstIndex = rivalRows[0]?.indexOf('첫번째 점수') ?? -1;
    const secondIndex = rivalRows[0]?.indexOf('두번째 점수') ?? -1;
    if ([songTitleIndex, rivalTitleIndex, firstIndex, secondIndex].includes(-1)) {
      throw new Error('CSV 열 이름을 확인해 주세요.');
    }

    songs = songRows.slice(1).map((row) => row[songTitleIndex]?.trim()).filter(Boolean);
    if (songs.length < 3) throw new Error('곡이 3개보다 적습니다.');

    rivalScores = new Map(rivalRows.slice(1).filter((row) => row[rivalTitleIndex]?.trim()).map((row) => [
      row[rivalTitleIndex].trim(),
      { first: row[firstIndex]?.trim() || '0', second: row[secondIndex]?.trim() || '0' },
    ]));

    songCount.textContent = `전체 ${songs.length}곡`;
    buttonLabel.textContent = '랜덤 3곡 뽑기';
    statusMessage.textContent = '준비됐어요. 버튼을 눌러 시작하세요.';
    drawButton.disabled = false;
  } catch (error) {
    songCount.textContent = '불러오기 실패';
    buttonLabel.textContent = 'CSV 파일을 확인해 주세요';
    statusMessage.textContent = '곡이나 점수 목록을 불러오지 못했어요. 페이지를 새로고침해 주세요.';
    statusMessage.classList.add('error');
    console.error('CSV 파일을 불러오지 못했습니다:', error);
  }
}

loadSongs();
