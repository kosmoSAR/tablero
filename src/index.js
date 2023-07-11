import { fromEvent, merge } from 'rxjs';
import { map, mergeAll, takeUntil } from 'rxjs/operators';

const canvas = document.getElementById('reactive-canvas')
const restartButton = document.getElementById('restart-button')
const cursorPosition = { x: 0, y: 0 };

const updateCursorPosition = (event) => {
    cursorPosition.x = event.clientX - canvas.offsetLeft;
    cursorPosition.y = event.clientY - canvas.offsetTop;
}

const onMouseDown$ = fromEvent(canvas, 'mousedown');
onMouseDown$.subscribe(updateCursorPosition);

const onMouseUp$ = fromEvent(canvas, 'mouseup');
const onMouseMove$ = fromEvent(canvas, 'mousemove').pipe(takeUntil(onMouseUp$));

let mousePressed = onMouseDown$.subscribe();

const canvasContext = canvas.getContext("2d");
canvasContext.lineWidth = 8;
canvasContext.lineJoin = 'round'
canvasContext.lineCap = 'round'
canvasContext.strokeStyle = "white";

const paintStroke = (event) => {
    canvasContext.beginPath();
    //Toma el valor de inicio
    canvasContext.moveTo(cursorPosition.x, cursorPosition.y);
    updateCursorPosition(event);
    //Toma los valores siguientes y se repite cada vez que el mouse se mueva
    canvasContext.lineTo(cursorPosition.x, cursorPosition.y);
    canvasContext.stroke();
    canvasContext.closePath();
}

const startPaint$ = onMouseDown$.pipe(
    //Para que nos devuelva los valores de onMouseMove
    map( () => onMouseMove$ ),
    mergeAll()
);

let startPaintSubscription = startPaint$.subscribe(paintStroke);

const onLoadWindow$ = fromEvent(window, "load");
const onRestartClick$ = fromEvent(restartButton, "click");

const restartWhiteBoard$ = merge(onLoadWindow$, onRestartClick$);

restartWhiteBoard$.subscribe(() => {
    startPaintSubscription.unsubscribe();
    mousePressed.unsubscribe();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    startPaintSubscription = startPaint$.subscribe(paintStroke);
    mousePressed = onMouseDown$.subscribe();
})