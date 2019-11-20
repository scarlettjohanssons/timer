import { Observable, timer, NEVER, BehaviorSubject, fromEvent, of } from 'rxjs';
import { map, tap, takeWhile, share, startWith, switchMap, filter, delay, throttleTime } from 'rxjs/operators';

const toggle$ = new BehaviorSubject(true);

const K = 1000;
const INTERVAL = K;
const HOURS = 0.0;
const MINUTES = 0.0;
const TIME = MINUTES * K * 60;
const HTIME = HOURS * TIME;
const start = document.getElementById('start');
const reset = document.getElementById('reset');
const wait = document.getElementById('wait');

let current: number;
let time = TIME;
let htime = HTIME;
//Старт
start.addEventListener('click', function() {
  
  const toHoursDisplay = (ms: number) => Math.floor(ms / K / 3600) % 60;
  const toMinutesDisplay = (ms: number) => Math.floor(ms / K / 60) % 60;
  const toSecondsDisplay = (ms: number) => Math.floor(ms / K) % 60;

  const toSecondsDisplayString = (ms: number) => {
    const seconds = toSecondsDisplay(ms);
    return seconds < 10 ? `0${seconds}` : seconds.toString();
  };

  const toMinutesDisplayString = (ms: number) => {
    const minutes = toMinutesDisplay(ms);
    return minutes < 10 ? `0${minutes}` : minutes.toString();
  };

  const currentSeconds = () => time / INTERVAL;
  const toMs = (t: number) => t * INTERVAL
  const toRemainingSeconds = (t: number) => currentSeconds() + t;

  const currentMinutes = () => htime / INTERVAL;
  const toM = (ht: number) => ht * INTERVAL;
  const toRemainingMinutes = (ht: number) => currentMinutes() + ht;

  const remainingSeconds$ = toggle$.pipe(
    switchMap((running: boolean) => (running ? timer(0, INTERVAL) : NEVER)),
    map(toRemainingSeconds),
    takeWhile(t => t >= 0),
  );
  const remainingMinutes$ = toggle$.pipe(
    switchMap((running: boolean) => (running ? timer(0, INTERVAL) : NEVER)),
    map(toRemainingMinutes),
    takeWhile(ht => ht >= 0),
  );

  const ms$ = remainingSeconds$.pipe(
    map(toMs),
    tap(t => current = t),
  );
  const hm$ = remainingMinutes$.pipe(
    map(toM),
    tap(ht => current = ht)
  );


  const minutes$ = ms$.pipe(
    map(toMinutesDisplay),
    map(s => s.toString()),
    startWith(toMinutesDisplay(time).toString())
  );
  const hours$ = hm$.pipe(
    map(toHoursDisplay),
    map(h => h.toString()),
    startWith(toHoursDisplay(time).toString())
  );

  const seconds$ = ms$.pipe(
    map(toSecondsDisplayString),
    startWith(toSecondsDisplayString(time).toString())
  );
  const minute$ = hm$.pipe(
    map(toMinutesDisplayString),
    startWith(toMinutesDisplayString(time).toString())
  );

  updateDom(hours$, hoursElement);
  updateDom(minute$, minutesElement);
  updateDom(seconds$, secondsElement);

  remainingMinutes$.subscribe({
    complete: () => updateDom(of('Done'), done)
  });

  
  
});




const hoursElement = document.querySelector('.hours');
const minutesElement = document.querySelector('.minutes');
const secondsElement = document.querySelector('.seconds');
const toggleElement = document.querySelector('.stop');
const done = document.querySelector('.done');
//Сбить таймер
reset.addEventListener('click', function() {
  time = 0;
  htime = 0;
});

// Событие клик на кнопку Stop
fromEvent(toggleElement, 'click').subscribe(() => {
  toggle$.next(!toggle$.value);
});
//Должна быть задержка на 300мс
const clic = fromEvent(wait, 'dblclick');
const delayClick = clic.pipe(throttleTime(2000));
delayClick.subscribe(() => {
  toggle$.next(toggle$.value);
});



// Обновление времени
toggle$.pipe(
  filter((toggled: boolean) => !toggled)
).subscribe(() => {
  time = current;
  htime = current;
});




function updateDom(source$: Observable<string>, element: Element) {
  source$.subscribe((value) => element.innerHTML = value);
}