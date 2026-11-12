'use strict';

function publicLink(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

const configuredLinks = window.HAPPY_VILLAGE_LINKS || {};
for (const link of document.querySelectorAll('[data-resource]')) {
  const individualLink = publicLink(configuredLinks[link.dataset.resource]);
  const destination = individualLink || publicLink(configuredLinks.sharedFolder);
  if (!destination) continue;
  link.href = destination;
  link.hidden = false;
  if (!individualLink) {
    link.textContent = '공유 폴더 열기 ↗';
    link.setAttribute('aria-label', '공유 폴더 열기 (새 탭)');
  }
}

const lessonNav = document.querySelector('.lesson-nav');
const lessonTabs = [...document.querySelectorAll('[data-lesson]')];
const panels = lessonTabs.map(tab => document.getElementById(`lesson-${tab.dataset.lesson}`));
lessonNav.setAttribute('role', 'tablist');
lessonTabs.forEach((tab, index) => {
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panels[index].id);
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].setAttribute('aria-labelledby', tab.id);
  panels[index].tabIndex = 0;
});

function showLesson(index, moveFocus = false) {
  lessonTabs.forEach((tab, i) => {
    const current = i === index;
    tab.setAttribute('aria-selected', String(current));
    tab.tabIndex = current ? 0 : -1;
    panels[i].hidden = !current;
  });
  if (moveFocus) lessonTabs[index].focus();
}

lessonTabs.forEach((tab, index) => {
  tab.addEventListener('click', event => {
    event.preventDefault();
    showLesson(index);
  });
  tab.addEventListener('keydown', event => {
    const last = lessonTabs.length - 1;
    const positions = { ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1, Home: 0, End: last };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    showLesson(positions[event.key], true);
  });
});
const linkedLesson = panels.findIndex(panel => `#${panel.id}` === location.hash);
showLesson(Math.max(0, linkedLesson));

const worksheetImages = {
  3: { file: './assets/worksheet-3.webp', alt: '3차시 나의 감정 방 짓기 학생 활동지' },
  7: { file: './assets/worksheet-7.webp', alt: '7차시 공공시설을 함께 지어요 학생 활동지' }
};
const worksheetChoices = [...document.querySelectorAll('[data-show-sheet]')];
function showSheet(number) {
  const sheet = worksheetImages[number];
  const image = document.getElementById('sheet-image');
  image.src = sheet.file;
  image.alt = sheet.alt;
  const imageLink = document.getElementById('sheet-image-link');
  imageLink.href = sheet.file;
  imageLink.setAttribute('aria-label', `${sheet.alt} 이미지 크게 보기 (새 탭)`);
  worksheetChoices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.showSheet === number)));
}
worksheetChoices.forEach(button => button.addEventListener('click', () => showSheet(button.dataset.showSheet)));

for (const trigger of document.querySelectorAll('[data-dialog]')) {
  trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const dialog = document.getElementById(trigger.dataset.dialog);
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    if (dialog.id === 'sheet-dialog') showSheet(trigger.dataset.sheet || '3');
    dialog.showModal();
    dialog.querySelector('[data-close]').focus();
  });
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
