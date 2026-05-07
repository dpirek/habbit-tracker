import BaseComponent from '../base-component.js';

function dateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class CalendarWidget extends BaseComponent {
  constructor({
    variant = 'default',
    mode = 'done',
    showControls = true,
    monthAnchor = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    markedDateKeys = new Set(),
    onMonthChange = null
  } = {}) {
    super();
    this.variant = variant;
    this.mode = mode;
    this.showControls = showControls;
    this.monthAnchor = monthAnchor;
    this.markedDateKeys = markedDateKeys;
    this.onMonthChange = onMonthChange;
    this.render();
  }

  setMonthAnchor(monthAnchor) {
    this.monthAnchor = monthAnchor;
    this.render();
  }

  setMarkedDateKeys(markedDateKeys) {
    this.markedDateKeys = markedDateKeys;
    this.render();
  }

  prevMonth() {
    this.monthAnchor = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() - 1, 1);
    this.onMonthChange?.(this.monthAnchor);
    this.render();
  }

  nextMonth() {
    this.monthAnchor = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() + 1, 1);
    this.onMonthChange?.(this.monthAnchor);
    this.render();
  }

  getClassMap() {
    if (this.variant === 'template') {
      return {
        month: 'template-detail-calendar-month',
        daysHeader: 'template-detail-calendar-days',
        dayLabel: 'template-detail-calendar-day-label',
        grid: 'template-detail-calendar-grid',
        cell: 'template-detail-calendar-cell',
        active: 'active'
      };
    }

    return {
      month: 'calendar-month-title',
      daysHeader: 'calendar-days-header',
      dayLabel: 'calendar-day-label',
      grid: 'calendar-grid',
      cell: 'calendar-cell',
      active: 'done'
    };
  }

  render() {
    this.clear();
    const classes = this.getClassMap();

    if (this.showControls) {
      const top = this.createElement('div', { class: 'calendar-top-row' });
      const monthTitle = this.createElement('h2', {
        class: classes.month,
        innerText: this.monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      });
      const controls = this.createElement('div', { class: 'calendar-controls' });
      const prevBtn = this.createElement('button', { class: 'calendar-arrow', type: 'button', innerText: '‹' });
      const nextBtn = this.createElement('button', { class: 'calendar-arrow', type: 'button', innerText: '›' });
      prevBtn.addEventListener('click', () => this.prevMonth());
      nextBtn.addEventListener('click', () => this.nextMonth());
      controls.append(prevBtn, nextBtn);
      top.append(monthTitle, controls);
      this.append(top);
    } else {
      const monthLabel = this.createElement('p', {
        class: classes.month,
        innerText: this.monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      });
      this.append(monthLabel);
    }

    const daysHeader = this.createElement('div', { class: classes.daysHeader });
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d) => {
      daysHeader.append(this.createElement('span', { class: classes.dayLabel, innerText: d }));
    });
    this.append(daysHeader);

    const grid = this.createElement('div', { class: classes.grid });
    const year = this.monthAnchor.getFullYear();
    const month = this.monthAnchor.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const start = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < start; i += 1) {
      grid.append(this.createElement('span', { class: `${classes.cell} empty` }));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const current = new Date(year, month, day);
      const key = dateKeyLocal(current);
      const marked = this.markedDateKeys?.has(key);
      const cell = this.createElement('span', {
        class: `${classes.cell}${marked ? ` ${classes.active}` : ''}`,
        innerText: marked && this.mode === 'done' ? '✓' : String(day)
      });

      const isToday = current.getFullYear() === today.getFullYear()
        && current.getMonth() === today.getMonth()
        && current.getDate() === today.getDate();

      if (isToday) {
        cell.classList.add('today');
      }

      grid.append(cell);
    }

    this.append(grid);
  }
}

if (!customElements.get('calendar-widget')) {
  customElements.define('calendar-widget', CalendarWidget);
}

export default CalendarWidget;
