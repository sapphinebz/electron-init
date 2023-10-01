import { AsyncSubject, BehaviorSubject, Subject, takeUntil } from "rxjs";

const tmpl = document.createElement("template");
tmpl.innerHTML = `
  <style>
  .lds-ring {
    display: inline-block;
    position: relative;
    width: var(--main-width);
    height: var(--main-height);
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: var(--ring-width);
    height: var(--ring-height);
    margin: 8px;
    border: var(--right-border) solid var(--bg-color);
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: var(--bg-color) transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>
  <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
`;

const COLOR_ATTR = "color";
const SIZE_ATTR = "size";
export class IdsRingSpinner extends HTMLElement {
  static get observedAttributes(): string[] {
    return [COLOR_ATTR, SIZE_ATTR];
  }

  onDestroy = new AsyncSubject<void>();
  colorChange = new BehaviorSubject<string>("red");
  sizeChange = new BehaviorSubject<string>("normal");

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(tmpl.content.cloneNode(true));
  }

  connectedCallback() {
    this.colorChange.pipe(takeUntil(this.onDestroy)).subscribe((value) => {
      this.style.setProperty("--bg-color", value);
    });

    this.sizeChange.pipe(takeUntil(this.onDestroy)).subscribe((value) => {
      switch (value) {
        case "small":
          this.style.setProperty("--ring-width", "24px");
          this.style.setProperty("--ring-height", "24px");
          this.style.setProperty("--right-border", "4px");
          this.style.setProperty("--main-width", "40px");
          this.style.setProperty("--main-height", "40px");
          break;

        default:
          this.style.setProperty("--ring-width", "64px");
          this.style.setProperty("--ring-height", "64px");
          this.style.setProperty("--right-border", "8px");
          this.style.setProperty("--main-width", "80px");
          this.style.setProperty("--main-height", "80px");
          break;
      }
    });
  }

  attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
    switch (attrName) {
      case COLOR_ATTR:
        this.colorChange.next(newVal);
        break;
      case SIZE_ATTR:
        this.sizeChange.next(newVal);
        break;

      default:
        break;
    }
  }

  disconnectedCallback() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}

customElements.define("ids-ring-spinner", IdsRingSpinner);

export function manageSpinner(el: IdsRingSpinner) {
  const taskCount = new BehaviorSubject<number>(0);
  taskCount.subscribe((count) => {
    if (count > 0) {
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
  return {
    addTask: () => {
      taskCount.next(taskCount.value + 1);
    },
    doneTask: () => {
      taskCount.next(taskCount.value - 1);
    },
  };
}
