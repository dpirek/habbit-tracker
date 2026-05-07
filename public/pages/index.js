import LighhouseIsland from '../components/islands/lighthouse-island2.js';
import WhirlpoolIsland from '../components/islands/whirlpool-island.js';
import FishIsland from '../components/islands/fish-island.js';
import ProgressHeader from '../components/shared/progress-header.js';
import ProgressBar from '../components/shared/progress-bar.js';
import BottomMenu from '../components/shared/bottom-menu.js';

const ISLAND_CONTENT_API_URL = '/api/island';
const ISLAND_PROGRESS_STORAGE_KEY = 'island_progress';

function parseStageValue(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (Number.isNaN(parsed)) {
    return 1;
  }
  return Math.min(7, Math.max(1, parsed));
}

function toIslandIconStates(stageValue) {
  const stage = parseStageValue(stageValue);
  const unlockedCount = Math.min(6, Math.max(0, stage - 1));
  return Array.from({ length: 6 }, (_, index) => (index < unlockedCount ? 1 : 0));
}

function getProgressMap() {
  try {
    const raw = window.localStorage.getItem(ISLAND_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function getIslandProgressStage(islandId, progressMap) {
  return parseStageValue(progressMap?.[islandId] || 1);
}

function getListPageProgress(progressMap) {
  if (!progressMap || typeof progressMap !== 'object') {
    return 0;
  }

  const stages = Object.values(progressMap).map((value) => parseStageValue(value));
  if (!stages.length) {
    return 0;
  }

  const maxStage = Math.max(...stages);
  return Math.max(0, Math.min(7, maxStage));
}

function createPlaceholderIsland({
    label,
    island: islandData = null,
    progress = 1,
    alignment = 'left',
    islandType = 'lighthouse'
  }) {

  const isRightAligned = alignment === 'right';
  const card = document.createElement('article');
  card.setAttribute('aria-label', label);
  Object.assign(card.style, {
    display: 'grid',
    gap: '8px',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    width: '94%',
    justifySelf: isRightAligned ? 'end' : 'start'
  });

  const titleRow = document.createElement('div');
  titleRow.setAttribute('data-title-row', 'true');
  Object.assign(titleRow.style, {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: isRightAligned ? 'flex-end' : 'flex-start',
    gap: '8px',
    marginBottom: '6px'
  });
  
  const progressHeader = new ProgressHeader({
    text: label,
    progress
  });

  Object.assign(progressHeader.style, {
    flex: '0 1 40%'
  });

  titleRow.append(progressHeader);

  const islandFrame = document.createElement('div');
  Object.assign(islandFrame.style, {
    width: '86%',
    display: 'block',
    overflow: 'hidden',
    justifySelf: isRightAligned ? 'end' : 'start',
    lineHeight: '0',
    aspectRatio: '1080 / 1920'
  });

  let island;
  const islandState = Array.isArray(islandData?.state) ? islandData.state : [];
  const lighthouseState = parseStageValue(islandData?.lighthouseState ?? islandData?.stage ?? 1);
  if (islandType === 'whirlpool') {
    island = new WhirlpoolIsland({
      width: '100%',
      height: '100%',
      state: islandState,
      alt: `${label} placeholder`
    });
  } else if (islandType === 'fish') {
    island = new FishIsland({
      width: '100%',
      height: '100%',
      state: islandState,
      alt: `${label} placeholder`
    });
  } else {
    island = new LighhouseIsland({
      width: '100%',
      height: '100%',
      state: islandState.length ? islandState : [1, 1, 1, 1, 1, 1],
      lighthouseState,
      alt: `${label} placeholder`
    });
  }
  
  Object.assign(island.style, {
    width: '100%',
    height: '100%',
    display: 'block',
    pointerEvents: 'none',
    overflow: 'hidden'
  });

  islandFrame.append(island);
  card.append(titleRow, islandFrame);
  return card;
}

function getIslandId(item, index) {
  const candidateKeys = ['id', 'island_id', 'slug', 'name'];
  for (const key of candidateKeys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return encodeURIComponent(String(value).trim());
    }
  }

  return String(index + 1);
}

function bindIslandNavigation(card, islandId, router, options = {}) {
  const { isLighthouseIsland = false } = options;
  let isNavigating = false;

  Object.assign(card.style, {
    cursor: 'pointer'
  });
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const navigateToIsland = async () => {
    if (isNavigating) {
      return;
    }
    if (!router) return;
    isNavigating = true;
    try {
      const isMapPath = window.location.pathname === '/child/map';
      const navigateTo = isMapPath && isLighthouseIsland
        ? '/child/lighthouse-intro'
        : `/child/island/${islandId}`;
      router.navigate(navigateTo);
    } finally {
      isNavigating = false;
    }
  };

  card.addEventListener('click', navigateToIsland);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToIsland();
    }
  });
}

function toIslandLabel(item, index) {
  const keys = ['name', 'title', 'island_name', 'slug', 'id'];
  for (const key of keys) {
    if (item && item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== '') {
      return String(item[key]);
    }
  }

  return `Island ${index + 1}`;
}

async function fetchIslandContent() {
  const response = await fetch(ISLAND_CONTENT_API_URL);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload;
}

function normalizeIslandToken(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');
}

function getIslandOrderRank(item) {
  const keys = ['name', 'title', 'island_name', 'slug', 'id'];
  const token = normalizeIslandToken(
    keys
      .map((key) => item?.[key])
      .filter((value) => value !== undefined && value !== null)
      .join(' ')
  );

  if (token.includes('fish')) return 0;
  if (token.includes('whirlpool') || token.includes('whirpool')) return 1;
  if (token.includes('lighthouse') || token.includes('lighhouse')) return 2;
  return 99;
}

function getIslandVisualType(item, fallbackIndex = 0) {
  if (fallbackIndex === 0) return 'lighthouse';
  if (fallbackIndex === 1) return 'whirlpool';
  if (fallbackIndex === 2) return 'fish';
  return 'lighthouse';
}

export default async function renderIndexPage(container, router) {
  if (!container) {
    return;
  }

  const page = document.createElement('section');
  Object.assign(page.style, {
    minHeight: '100%',
    width: '100%',
    boxSizing: 'border-box',
    padding: '20px 20px 150px',
    display: 'grid',
    gap: '12px',
    alignContent: 'start'
  });

  const list = document.createElement('div');
  Object.assign(list.style, {
    display: 'grid',
    gap: '10px'
  });

  const progressMap = getProgressMap();
  const MENU_ICON_CLOSED = '/images/svg/seagel.svg';
  const MENU_ICON_OPEN = '/images/svg/menu/navigate.svg';
  const bottomProgressBar = new ProgressBar();
  bottomProgressBar.embedded = true;
  bottomProgressBar.progress = getListPageProgress(progressMap);
  const bottomMenu = new BottomMenu();
  bottomMenu.style.display = 'none';
  bottomMenu.setMenuButtons([
    bottomMenu.createIconActionButton({
      label: 'Map',
      iconSrc: '/images/svg/menu/map.svg',
      navigateTo: '/child/map'
    }),
    bottomMenu.createIconActionButton({
      label: 'Journey',
      iconSrc: '/images/svg/menu/journey.svg',
      navigateTo: '/child/journey',
      raised: true
    }),
    bottomMenu.createIconActionButton({
      label: 'Shop',
      iconSrc: '/images/svg/menu/shop.svg',
      navigateTo: '/child/shop'
    })
  ]);
  bottomMenu.append(bottomProgressBar);

  const menuToggleButton = document.createElement('button');
  menuToggleButton.type = 'button';
  menuToggleButton.setAttribute('aria-label', 'Open menu');
  menuToggleButton.innerHTML = `<img src="${MENU_ICON_CLOSED}" alt="" aria-hidden="true" />`;
  Object.assign(menuToggleButton.style, {
    position: 'fixed',
    left: '50%',
    bottom: '20px',
    transform: 'translateX(-50%)',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '1px solid #000',
    background: '#fff',
    color: '#111',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    zIndex: '1300',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    display: 'grid',
    placeItems: 'center',
    padding: '0'
  });
  const menuToggleIcon = menuToggleButton.querySelector('img');
  if (menuToggleIcon) {
    Object.assign(menuToggleIcon.style, {
      width: '34px',
      height: '34px',
      display: 'block'
    });
  }

  menuToggleButton.addEventListener('click', () => {
    if (menuToggleIcon) {
      menuToggleIcon.src = MENU_ICON_OPEN;
    }
    bottomMenu.style.display = 'grid';
    menuToggleButton.style.display = 'none';
    const menuAnimation = bottomMenu.animate(
      [
        { transform: 'translateX(-50%) translateY(100%)', opacity: '0' },
        { transform: 'translateX(-50%) translateY(0)', opacity: '1' }
      ],
      {
        duration: 260,
        easing: 'ease-out'
      }
    );

    const animateButtons = () => {
      const buttons = bottomMenu.querySelectorAll('[data-bottom-menu-controls="true"] button');
      buttons.forEach((button, index) => {
        const isRaisedButton = index === 1;
        const restingTransform = isRaisedButton ? 'translateY(-50%)' : 'translateY(0)';
        const jumpTransform = isRaisedButton ? 'translateY(calc(-50% - 12px))' : 'translateY(-12px)';
        button.animate(
          [
            { transform: restingTransform },
            { transform: jumpTransform },
            { transform: restingTransform }
          ],
          {
            duration: 420,
            delay: index * 80,
            easing: 'cubic-bezier(0.2, 0.75, 0.2, 1)'
          }
        );
      });
    };

    if (menuAnimation && menuAnimation.finished) {
      menuAnimation.finished.then(animateButtons).catch(() => {});
    } else {
      animateButtons();
    }
  });

  page.append(list, bottomMenu, menuToggleButton);
  container.replaceChildren(page);

  let islands = [];
  try {
    islands = await fetchIslandContent();
  } catch (_) {
    islands = [];
  }

  if (!islands.length) {
    list.append(createPlaceholderIsland({
      label: 'No islands found',
      progress: 1,
      islandType: 'lighthouse'
    }));
    return;
  }

  islands.forEach((island, index) => {
    const islandId = getIslandId(island, index);
    const decodedIslandId = decodeURIComponent(islandId);
    const card = createPlaceholderIsland({
      label: toIslandLabel(island, index),
      island,
      progress: island.progress || getIslandProgressStage(decodedIslandId, progressMap),
      alignment: index % 2 === 0 ? 'left' : 'right',
      islandType: island.type || getIslandVisualType(island, index)
    });
    card.setAttribute('data-island-id', decodedIslandId);
    list.append(card);
  });

  const cardsByIslandId = new Map(
    Array.from(list.children).map((card) => [card.getAttribute('data-island-id'), card])
  );

  islands.forEach((island, index) => {
    const islandId = getIslandId(island, index);
    const decodedIslandId = decodeURIComponent(islandId);
    const card = cardsByIslandId.get(decodedIslandId);
    if (!card) {
      return;
    }

    const islandType = String(island?.type || '').toLowerCase();
    bindIslandNavigation(card, islandId, router, {
      isLighthouseIsland: islandType === 'lighthouse'
    });
  });

  // Scroll to bottom.
  requestAnimationFrame(() => {
    const maxScrollTop = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    window.scrollTo({ top: maxScrollTop, behavior: 'auto' });
  });
}
