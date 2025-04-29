
(function () {
    console.log('[Injected] Starting DOM event tracker...');

    function sendEvent(event) {
        debugger;
        fetch('http://localhost:4000/event-track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: event.type,
                target: event.target.tagName,
                timestamp: Date.now()
            })
        }).catch(err => console.error('Event send error', err));
    }

    ['click', 'input', 'keydown'].forEach(type => {
        document.addEventListener(type, sendEvent, true);
    });
})();
