import {observable, action, makeObservable} from 'mobx';

export interface ModalOptions {
  // default: bottom
  align?: 'top' | 'center' | 'bottom';

  container?: React.ElementType;
  containerProps?: any;
  openImmediately?: boolean;
}

export class ModalState {
  public readonly id: string;
  public readonly element: React.ElementType;
  public readonly options: ModalOptions;

  @observable.ref
  public props: any;

  @observable
  public isClosing = false;

  constructor(
    id: string,
    element: React.ElementType,
    props: any,
    options: ModalOptions,
    public readonly modalDetachedCallback: () => void,
  ) {
    this.id = id;
    this.element = element;
    this.props = props;
    this.options = options;

    makeObservable(this);
  }

  @action
  setProps(props: any) {
    this.props = props;
  }

  @action
  setIsClosing(isClosing: boolean) {
    this.isClosing = isClosing;
  }
}

export class ModalStates {
  @observable.ref
  public _modals: ModalState[] = [];

  protected lastId = 0;

  constructor() {
    makeObservable(this);
  }

  @action
  createModal(
    element: React.ElementType,
    props: any,
    options: ModalOptions,
    modalDetachedCallback: () => void,
  ): string {
    this.lastId++;
    const id = this.lastId.toString();
    const modalState = new ModalState(
      id,
      element,
      props,
      options,
      modalDetachedCallback,
    );
    this._modals.push(modalState);
    this._modals = this._modals.slice();
    return id;
  }

  updateProps(id: string, props: any) {
    const modalState = this._modals.find(modal => modal.id === id);
    if (modalState) {
      modalState.setProps(props);
    }
  }

  @action
  detachModal(id: string) {
    const index = this._modals.findIndex(modal => modal.id === id);
    if (index >= 0) {
      const modal = this._modals[index];

      this._modals.splice(index, 1);
      this._modals = this._modals.slice();

      modal.modalDetachedCallback();
    }
  }

  get modals() {
    return this._modals;
  }

  getModal(id: string) {
    return this._modals.find(modal => modal.id === id);
  }
}

export const globalModalStates = new ModalStates();
