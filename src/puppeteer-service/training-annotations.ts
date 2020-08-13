// FIXME: cleanups
// FIXME: avoid ts-ignores wherever possible

// @ts-ignore
window.__isUpdatingSelector = false;

function markLabel(element, selectorObj) {
    const { selector, name } = selectorObj;
    // element.style.color = 'blue';
    element.style.border = 'dotted';
    element.style['border-width'] = '2px';
    element.style['border-color'] = 'black';
    // element.style['background-color'] = 'rgb(255, 255, 0, 0.3)';
    addAnnotation(element, name);
}

function addAnnotation(element, annotationText) {
    const newDiv = document.createElement('div');
    const newContent = document.createTextNode(annotationText);

    // const { top, left } = getOffset(element);
    const left = element.offsetLeft - 9 * annotationText.length;
    const top = element.offsetTop;

    newDiv.style.color = 'red';
    newDiv.style.position = 'absolute';
    // newDiv.style.top = '-15px';

    // newDiv.style.left = `-${70 + 4 * annotationText.length}px`;
    newDiv.style.left = `${left}px`;
    newDiv.style.top = `${top}px`;

    newDiv.style.color = 'black';
    newDiv.style['font-weight'] = 'bold';
    newDiv.style.background = 'rgb(255,255,0, 0.3)';
    newDiv.style.padding = '6px';
    newDiv.style['border-radius'] = '32px';

    newDiv.appendChild(newContent);
    const updateButton = addUpdateButton();
    newDiv.appendChild(updateButton);
    // element.parentNode.insertBefore(updateButton, element);
    element.parentNode.insertBefore(newDiv, element);
}

function applyMask(target) {
    if (document.getElementsByClassName('highlight-wrap').length > 0) {
        resizeMask(target);
    } else {
        createMask(target);
    }
}

function resizeMask(target) {
    const rect = target.getBoundingClientRect();
    const hObj: Partial<HTMLElement> = document.getElementsByClassName('highlight-wrap')[0];
    hObj.style.top = rect.top + 'px';
    hObj.style.width = rect.width + 'px';
    hObj.style.height = rect.height + 'px';
    hObj.style.left = rect.left + 'px';
    // hObj.style.WebkitTransition='top 0.2s';
}

function createMask(target) {
    const rect = target.getBoundingClientRect();
    const hObj = document.createElement('div');
    hObj.className = 'highlight-wrap';
    hObj.style.position = 'absolute';
    hObj.style.top = rect.top + 'px';
    hObj.style.width = rect.width + 'px';
    hObj.style.height = rect.height + 'px';
    hObj.style.left = rect.left + 'px';
    hObj.style.backgroundColor = '#205081';
    hObj.style.opacity = '0.5';
    hObj.style.cursor = 'default';
    hObj.style.pointerEvents = 'none';
    // hObj.style.WebkitTransition='top 0.2s';
    document.body.appendChild(hObj);
}

function clearMasks() {
    const hwrappersLength = document.getElementsByClassName('highlight-wrap').length;
    const hwrappers = document.getElementsByClassName('highlight-wrap');
    if (hwrappersLength > 0) {
        for (let i = 0; i < hwrappersLength; i++) {
            hwrappers[i].remove();
        }
    }
}

function handleClick(e) {
    e.preventDefault();
    console.log('clicked ', e.target);
    if (e.target.id !== '$$update-selector-button$$') {

        // @ts-ignore
        window.__isUpdatingSelector = false;
        clearMasks();
        window.removeEventListener('mouseover', handleMouseHover);
        window.removeEventListener('click', handleClick);
    }
    return false;
}

function handleMouseHover(e) {
        // @ts-ignore
    if (window.__isUpdatingSelector) {
        applyMask(e.target);
    }
}

window.addEventListener('mouseover', (e) => handleMouseHover(e));
window.addEventListener('click', (e) => handleClick(e));

function addUpdateButton() {
    const newButton = document.createElement('button');
    const newContent = document.createTextNode('🔄');
    // FIXME: improve hardcoded values wherever possible
    newButton.id = '$$update-selector-button$$';
    newButton.style.color = 'red';
    newButton.style.position = 'absolute';
    newButton.style.left = `-35px`;
    // @ts-ignore
    newButton.addEventListener('click', e => {
        e.preventDefault();

        // @ts-ignore
        window.__isUpdatingSelector = true;
        // @ts-ignore
        window.__newSelectorSet = true;
        // @ts-ignore
        // @ts-ignore
        // console.log('click', (e.target as HTMLElement).parentNode.parentNode.children[1].innerText);
        const selectorClicked = (e.target as HTMLElement).parentNode.parentNode.children[1].innerText;

        // const event = new Event('onCustomEvent', { detail: newButton });
        const event = new CustomEvent('selectorUpdateClick', { detail: 'newButton' });
        // newButton.dispatchEvent(event);
        (window as any).onCustomEvent({ type: 'selectorUpdateClick', detail: selectorClicked.split('\n')[0] });

    });
    newButton.appendChild(newContent);
    return newButton;
}
