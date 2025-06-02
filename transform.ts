// transform.ts
import { FigmaDocumentNode } from "./types";

type DocumentIds = {
  parentId: string;
  modalId: string;
  headerId: string;
  bodyId: string;
  footerId: string;
};

type SlotConfig = {
  blockId: string;
  wrappedInLayout: boolean;
};

type ModalBlock = Record<
  string,
  {
    id: string;
    dpOn: string[];
    displayName: string;
    dataSourceIds: string[];
    parentId: string;
    visibility: { value: boolean };
    component: {
      componentType: "Modal";
      slots: Partial<{
        header: SlotConfig;
        body: SlotConfig;
        footer: SlotConfig;
      }>;
      content: {
        hideOnEscape: boolean;
        variant: string;
        pageId: string;
        hideOnClickOutside: boolean;
      };
      appearance: {
        width: { custom: string };
        height: { custom: string };
        styles: {
          borderColor: string;
          borderRadius: {
            all: string;
          };
        };
      };
    };
  }
>;

function getDocumentIds(): DocumentIds {
  return {
    parentId: "root_id",
    modalId: `b_${Math.random().toString(16).slice(2, 7)}`,
    headerId: `b_${Math.random().toString(16).slice(2, 7)}`,
    bodyId: `b_${Math.random().toString(16).slice(2, 7)}`,
    footerId: `b_${Math.random().toString(16).slice(2, 7)}`,
  };
}

function getAliasForBorderRadius(radiusInPixel?: number): string {
  const value = String(radiusInPixel);
  switch (value) {
    case "2":
    case "2.0":
      return "xxs";
    case "4":
    case "4.0":
      return "xs";
    case "8":
    case "8.0":
      return "md";
    case "10":
    case "10.0":
      return "3xl";
    case "12":
    case "12.0":
      return "5xl";
    default:
      return "none";
  }
}

export function transform(
  data: FigmaDocumentNode
): ModalBlock | { error: Error } {
  const modalComponent = data.children?.[0]?.children?.[0];
  if (!modalComponent) {
    return { error: new Error("Modal component structure invalid") };
  }

  const documentIds = getDocumentIds();
  const modalChildren = modalComponent.children?.[0]?.children || [];

  let modalBodyHeader: FigmaDocumentNode | undefined;
  let modalContent: FigmaDocumentNode | undefined;
  let modalBodyFooter: FigmaDocumentNode | undefined;

  for (const child of modalChildren) {
    const childName = (child.name || "").toLowerCase();
    if (childName.includes("header")) modalBodyHeader = child;
    else if (childName.includes("content")) modalContent = child;
    else if (childName.includes("action")) modalBodyFooter = child;
    else {
      return {
        error: new Error(
          `Unknown Element Found!! Cannot Transform ${child.name}`
        ),
      };
    }
  }

  if (modalChildren.length < 3) {
    const modalBodyComponent = modalComponent.children?.[0];
    if (modalBodyComponent?.itemSpacing !== undefined) {
      modalChildren.forEach((element, idx) => {
        if (idx !== 0) {
          element.paddingTop = modalBodyComponent.itemSpacing;
        }
      });
    }

    modalChildren.forEach((element, idx) => {
      if (idx === 0 && modalComponent.paddingTop !== undefined) {
        element.paddingTop = modalComponent.paddingTop;
      }
      if (
        idx === modalChildren.length - 1 &&
        modalComponent.paddingBottom !== undefined
      ) {
        element.paddingBottom = modalComponent.paddingBottom;
      }
      if (modalComponent.paddingLeft !== undefined) {
        element.paddingLeft = modalComponent.paddingLeft;
      }
      if (modalComponent.paddingRight !== undefined) {
        element.paddingRight = modalComponent.paddingRight;
      }
    });
  }

  const modalBlock: ModalBlock = {
    [documentIds.modalId]: {
      id: documentIds.modalId,
      dpOn: [],
      displayName: "Modal",
      dataSourceIds: [],
      parentId: documentIds.parentId,
      visibility: { value: true },
      component: {
        componentType: "Modal",
        slots: {},
        content: {
          hideOnEscape: true,
          variant: "card",
          pageId: "",
          hideOnClickOutside: true,
        },
        appearance: {
          width: {
            custom: `${Number(
              modalComponent.absoluteBoundingBox?.width || 0
            ).toFixed(0)}px`,
          },
          height: {
            custom: `${Number(
              modalComponent.absoluteBoundingBox?.height || 0
            ).toFixed(0)}px`,
          },
          styles: {
            borderColor: "border-transparent",
            borderRadius: {
              all: `rounded-${getAliasForBorderRadius(
                modalComponent.cornerRadius
              )}`,
            },
          },
        },
      },
    },
  };

  if (modalBodyHeader) {
    modalBlock[documentIds.modalId].component.slots.header = {
      blockId: documentIds.headerId,
      wrappedInLayout: true,
    };
  }

  if (modalContent) {
    modalBlock[documentIds.modalId].component.slots.body = {
      blockId: documentIds.bodyId,
      wrappedInLayout: true,
    };
  }

  if (modalBodyFooter) {
    modalBlock[documentIds.modalId].component.slots.footer = {
      blockId: documentIds.footerId,
      wrappedInLayout: true,
    };
  }

  return modalBlock;
}
