import { DomBuilder, ExtendedHTMLElement } from '../../../../helper/dom';
import { MynahUIGlobalEvents } from '../../../../helper/events';
import { generateUID } from '../../../../helper/guid';
import { MynahUITabsStore } from '../../../../helper/tabs-store';
import testIds from '../../../../helper/test-ids';
import { MynahEventNames, QuickActionCommand, QuickActionCommandGroup } from '../../../../static';
import { Icon, MynahIcons } from '../../../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../../overlay';
import { ActionPill } from './action-pill';

export interface PromptTopBarProps {
  classNames?: string[];
  tabId: string;
  contextItems: QuickActionCommand[];
  title?: string;
  actionPillConfig?: QuickActionCommand;
  actionPillItems?: QuickActionCommandGroup[];
}

export class PromptTopBar {
  render: ExtendedHTMLElement;
  hoveredItemId: string | undefined;
  visibleCount: number;
  overflowOverlay: Overlay;
  actionPill: ActionPill;
  private readonly props: PromptTopBarProps;

  constructor (props: PromptTopBarProps) {
    this.props = props;
    this.visibleCount = this.props.contextItems.length;

    this.actionPill = new ActionPill({ actionPillConfig: this.props.actionPillConfig, actionPillItems: this.props.actionPillItems });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.topBar,
      classNames: [ 'mynah-prompt-input-top-bar', ...(this.props.classNames ?? []) ],
      children: [
        this.generateTitle(),
        ...this.generateContextPills(),
        this.generateOverflowPill(),
        this.actionPill.render
      ]
    });

    // Add resize observer to handle responsive behavior
    this.setupResizeObserver();

    // Use setTimeout to ensure the DOM is fully rendered before measuring
    setTimeout(() => {
      this.recalculateVisibleItems();
    }, 100);
  }

  update (): void {
    this.render.update({
      children: [
        this.generateTitle(),
        ...this.generateContextPills(),
        this.generateOverflowPill(),
        this.actionPill.render
      ]
    });
  }

  generateTitle (): ExtendedHTMLElement | string {
    const { contextItems, title } = this.props;
    return title != null
      ? DomBuilder.getInstance().build({
        type: 'span',
        classNames: [ 'title' ],
        children: [
          contextItems.length === 0 ? title : title.charAt(0)
        ]
      })
      : '';
  }

  getVisibleContextItems (): QuickActionCommand[] {
    return this.props.contextItems.slice(0, this.visibleCount);
  }

  getOverflowContextItems (): QuickActionCommand[] {
    return this.props.contextItems.slice(this.visibleCount);
  }

  isHovered (item: QuickActionCommand): boolean {
    return (item.id != null ? item.id === this.hoveredItemId : item.command === this.hoveredItemId);
  }

  setHoveredItem (item: QuickActionCommand): void {
    this.hoveredItemId = item.id ?? item.command;
  }

  clearHoveredItem (): void {
    this.hoveredItemId = undefined;
  }

  generateContextPills (): Array<ExtendedHTMLElement | string> {
    const temporaryId = generateUID(); // is this needed?
    if (this.props.contextItems.length === 0) {
      return [ DomBuilder.getInstance().build({
        type: 'span',
        classNames: [ 'placeholder' ],
        children: [ MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptTopBarPlaceholder') ]
      }) ];
    } else if (this.visibleCount > 0) {
      console.log('hoveredItem', this.hoveredItemId);

      return this.getVisibleContextItems().map((contextItem) => DomBuilder.getInstance().build({
        type: 'span',
        children: [
          ...(this.isHovered(contextItem) ? [ new Icon({ icon: MynahIcons.CANCEL }).render ] : (contextItem.icon != null ? [ new Icon({ icon: contextItem.icon }).render ] : [ ])),
          { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
          { type: 'span', classNames: [ 'label' ], children: [ `${contextItem.command.replace(/^@?(.*)$/, '$1')}` ] }
        ],
        classNames: [ 'context' ],
        attributes: {
          'context-tmp-id': temporaryId,
          contenteditable: 'false'
        },
        events: {
          mouseover: (e) => {
            if (!this.isHovered(contextItem)) { this.setHoveredItem(contextItem); this.update(); }
          },
          mouseleave: (e) => {
            if (this.hoveredItemId != null) { this.clearHoveredItem(); } this.update();
          },
          click: (e) => this.removeContextPill(contextItem)
        }
      }));
    }
    return [ '' ];
  }

  removeContextPill (contextItem: QuickActionCommand): void {
    this.props.contextItems = this.props.contextItems.filter((item) => item.id !== contextItem.id);
    // todo: see if we need to send remove event to consumer
    this.update();
  }

  addContextPill (contextItem: QuickActionCommand): void {
    if (this.props.contextItems.find(({ id }) => id === contextItem.id) == null) {
      this.props.contextItems.push(contextItem);
      this.update();
      this.recalculateVisibleItems();
    }
  }

  getOverflowCount (): number {
    return this.props.contextItems.length - this.visibleCount;
  }

  // todo: add listener for item updates from consumer

  generateOverflowPill (): ExtendedHTMLElement | string {
    if (this.getOverflowCount() <= 0) {
      return '';
    }

    return DomBuilder.getInstance().build({
      type: 'span',
      children: [
        `+${this.getOverflowCount()}`
      ],
      classNames: [ 'context', 'overflow' ],
      attributes: {
        contenteditable: 'false'
      },
      events: {
        click: (e: Event) => {
          this.showOverflowOverlay(e);
        }
      }
    });
  }

  showOverflowOverlay (e: Event): void {
    this.overflowOverlay = new Overlay({
      testId: testIds.prompt.tobBarOverflowOverlay,
      background: true,
      closeOnOutsideClick: true,
      referenceElement: (e.currentTarget ?? e.target) as HTMLElement,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_TOP,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: this.generateOverflowOverlayChildren()
    });
  }

  generateOverflowOverlayChildren (): ExtendedHTMLElement[] {
    console.log('hoveredItem', this.hoveredItemId);
    return this.getOverflowContextItems().map((contextItem) => DomBuilder.getInstance().build({
      type: 'div',
      // shouldnt this overlay exactly match the one that pops up when you click @
      children: [
        ...(this.isHovered(contextItem) ? [ new Icon({ icon: MynahIcons.CANCEL }).render ] : (contextItem.icon != null ? [ new Icon({ icon: contextItem.icon }).render ] : [ ])),
        { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
        { type: 'span', classNames: [ 'label' ], children: [ `${contextItem.command.replace(/^@?(.*)$/, '$1')}` ] }
      ], // shouldnt we display label over the command, if label exists? not clear in documentation
      events: {
        mouseover: (e) => {
          if (!this.isHovered(contextItem)) { this.setHoveredItem(contextItem); this.overflowOverlay.updateContent(this.generateOverflowOverlayChildren()); }
        },
        mouseleave: (e) => {
          if (this.hoveredItemId != null) { this.clearHoveredItem(); } this.overflowOverlay.updateContent(this.generateOverflowOverlayChildren());
        },
        click: (e) => { this.removeContextPill(contextItem); this.overflowOverlay.updateContent(this.generateOverflowOverlayChildren()); }
      }
    }));
  }

  private setupResizeObserver (): void {
    // Use the existing MynahUIGlobalEvents system to listen for ROOT_RESIZE events
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.ROOT_RESIZE, () => {
      this.recalculateVisibleItems();
    });
  }

  // Sets visibleContextItems based on container width. Pills that don't fit will be moved into context overflow.
  // As width increases, move items back from context overflow into row of displayed pills.
  private recalculateVisibleItems (): void {
    const { contextItems } = this.props;
    if (contextItems.length === 0) return;

    const containerWidth = this.render.offsetWidth;
    const titleElement = this.render.querySelector<HTMLElement>('.title');
    const titleWidth = (titleElement != null) ? titleElement.offsetWidth + 8 : 0; // 8px for margin/padding
    const actionPillElement = this.render.querySelector<HTMLElement>('.pinned');
    const actionPillWidth = (actionPillElement != null) ? actionPillElement.offsetWidth + 8 : 0;
    const overflowElement = this.render.querySelector<HTMLElement>('.overflow');
    const overflowWidth = (overflowElement != null) ? overflowElement.offsetWidth + 8 : 0;

    // Available width for context pills
    const availableWidth = containerWidth - titleWidth - actionPillWidth - 16; // 16px for container padding

    // Check if we need to handle width increase scenario
    const shouldCheckForExpansion = this.getOverflowCount() > 0;
    if (shouldCheckForExpansion) {
      // Try to add one more item from overflow if we have at least 100px of extra space
      const extraSpaceNeeded = 100; // Maximum width for a pill to be brought back

      // Calculate current used width
      let currentUsedWidth = 0;
      const currentPills = Array.from(this.render.querySelectorAll('.context:not(.pinned):not(.overflow)'));
      currentPills.forEach((pill) => {
        currentUsedWidth += (pill as HTMLElement).offsetWidth + 8; // 8px for gap
      });

      // Check if we have enough space to bring back an item from overflow
      const remainingWidth = availableWidth - currentUsedWidth - overflowWidth;
      if (remainingWidth >= extraSpaceNeeded && this.getOverflowCount() > 0) {
        // We have enough space to bring back at least one item
        this.visibleCount++;

        // Rebuild the component with the new visible items
        this.update();
        return; // Exit early as we've updated the component
      }
    }

    // Handle width decrease scenario
    // Get all context pills
    const contextPills = Array.from(this.render.querySelectorAll('.context:not(.pinned):not(.overflow)'));

    // Calculate how many pills can fit
    let usedWidth = 0;
    let visibleCount = 0;

    for (let i = 0; i < contextPills.length; i++) {
      const pill = contextPills[i] as HTMLElement;
      usedWidth += pill.offsetWidth + 8; // 8px for gap

      if (usedWidth > availableWidth) {
        break;
      }

      visibleCount++;
    }
    // If we need to adjust the visible items
    if (this.visibleCount !== visibleCount) {
      this.visibleCount = visibleCount;

      // Rebuild the component with the new visible items
      this.update();
    }
  }
}
