import OverlayManager from "./OverlayManager.class.js";

class EventHandler {
  #overlayManager = null;
  
  constructor() {
    this.#overlayManager = new OverlayManager();
    this.#initializeEventListener();
  }
  
  #initializeEventListener() {
    document.addEventListener('keydown', e => this.#handleKeyDown(e));
    document.addEventListener('mousemove', e => this.#handleMouseMove(e));
    document.addEventListener('click', e => this.#handleClick(e));
  }
  
  #handleKeyDown(e) {
    this.#overlayManager.handleKeyDown(e);
  }
  
  #handleMouseMove(e) {
    this.#overlayManager.handleMouseMove(e);
  }
  
  #handleClick(e) {
    this.#overlayManager.handleClick(e);
  }
}

export default EventHandler;