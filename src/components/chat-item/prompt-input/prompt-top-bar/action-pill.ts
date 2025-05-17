import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../../../helper/dom';
import { generateUID } from '../../../../helper/guid';
import testIds from '../../../../helper/test-ids';
import { ChatItemFormItem, QuickActionCommand, QuickActionCommandGroup } from '../../../../static';
import { DetailedListWrapper } from '../../../detailed-list/detailed-list';
import { Icon } from '../../../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../../overlay';

export interface ActionPillProps {
  actionPillConfig?: QuickActionCommand;
  actionPillItems?: QuickActionCommandGroup[];
}

// used for rules list
export class ActionPill {
  render: ExtendedHTMLElement;
  props: ActionPillProps;
  overlay: Overlay;
  quickPickItemsSelectorContainer: DetailedListWrapper;
  checkedItemState: Map<string, boolean>;

  constructor (props: ActionPillProps) {
    this.props = props;
    this.checkedItemState = new Map<string, boolean>();
    const temporaryId = generateUID();

    this.render = DomBuilder.getInstance().build({
      type: 'span',
      children: this.getActionPillChildren(),
      classNames: [ 'context', 'pinned' ],
      attributes: {
        'context-tmp-id': temporaryId,
        contenteditable: 'false'
      },
      events: {
        click: (e) => {
          this.showOverlay(e);
        }
      }
    });
  }

  showOverlay (e: Event): void {
    this.overlay = new Overlay({
      testId: testIds.prompt.tobBarActionOverlay,
      background: true,
      closeOnOutsideClick: true,
      referenceElement: (e.currentTarget ?? e.target) as HTMLElement,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_TOP,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: [ this.getQuickPickItemGroups(this.props.actionPillItems ?? []) ]
    });
  }

  getActionPillChildren (): Array<string | HTMLElement | DomBuilderObject> {
    return (this.props.actionPillConfig != null)
      ? [
          ...(this.props.actionPillConfig.icon != null ? [ new Icon({ icon: this.props.actionPillConfig.icon }).render ] : [ ]),
          { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
                `${this.props.actionPillConfig.command.replace(/^@?(.*)$/, '$1')}`
        ]
      : [ '' ];
  }

  handleItemSelected (command: QuickActionCommand): void {
    console.log('command clicked', command);
  }

  convertQuickActionCommandGroupsToFormItems (commandGroups: QuickActionCommandGroup[]): ChatItemFormItem[] {
    return commandGroups[0].commands.map((item) => ({ type: 'checkbox', id: item.id ?? item.command, label: item.label ?? item.command, value: this.checkedItemState.get(item.id ?? item.command) === true ? 'true' : 'false' }));
  }

  private readonly getQuickPickItemGroups = (quickPickGroupList: QuickActionCommandGroup[]): ExtendedHTMLElement => {
    const formItems = this.convertQuickActionCommandGroupsToFormItems(quickPickGroupList);
    if (this.quickPickItemsSelectorContainer == null) {
      this.quickPickItemsSelectorContainer = new DetailedListWrapper({
        descriptionTextDirection: 'rtl',
        detailedList: {
          filterOptions: formItems,
          selectable: false
        },
        onFilterValueChange: (filterValues) => {
          for (const filterValue of Object.entries(filterValues)) {
            this.checkedItemState.set(filterValue[0], filterValue[1] === 'true');
          }
        },
      });
    } else {
      this.quickPickItemsSelectorContainer.update({
        filterOptions: formItems,
      });
    }
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-quick-picks-overlay-wrapper' ],
      children: [
        this.quickPickItemsSelectorContainer.render
      ]
    });
  };
}
