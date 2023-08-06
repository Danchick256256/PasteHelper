/**
 * @name PasteHelper
 * @author escort__PHENIBUT
 * @authorId 343383572805058560
 * @description help to paste phrases
 * @version 1.0
 */

"use strict";

// src/plugins/InsertTimestamps/modal.tsx

const {useState} = BdApi.React;
const {
    Button,
    ModalFooter,
    TextInput,
    ModalRoot,
    Heading,
    ModalHeader,
    ModalCloseButton,
    ModalContent,
    Menu,
    Tooltip,
    openModal
} = BdApi.Webpack.getModule((m) => m.ModalContent);
const ButtonWrapperClasses = BdApi.Webpack.getModule((m) => m.buttonWrapper && m.buttonContent);
const invokeClasses = (...names) => names.map((n) => `vbd-its-${n}`).join(" ");


const savePhrases = ({...array}) => {
    const jsonData = JSON.stringify(array, null, 2);
    require("fs").writeFileSync(require("path").join(BdApi.Plugins.folder, "config.js"), jsonData, 'utf8');
}


const createButton = (rootProps, phrase) => {
    return BdApi.React.createElement('div', {
            style: {
                display: 'flex',
            }
        },
        BdApi.React.createElement(Button, {
            className: invokeClasses("insert-button"),
            onClick: () => {
                rootProps.onClose();
                const clearText = BdApi.Webpack.getModule((m) => m.emitter?._events?.CLEAR_TEXT, {
                    searchExports: true
                });
                clearText.dispatchToLastSubscribed("CLEAR_TEXT");

                setTimeout(() => {
                    const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.INSERT_TEXT, {
                        searchExports: true
                    });
                    ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                        rawText: phrase
                    });

                    setTimeout(() => {
                        const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.TEXTAREA_FOCUS, {
                            searchExports: true
                        });
                        ComponentDispatch.dispatch("TEXTAREA_FOCUS", null);
                    }, 250);
                }, 1);
            }
        }, phrase.length > 46 ? phrase.slice(0, 45) + "..." : phrase),
        BdApi.React.createElement(Tooltip, {
            text: "Delete phrase"
        }, ({onMouseEnter, onMouseLeave}) => BdApi.React.createElement("div", {},
            BdApi.React.createElement(Button, {
                style: {
                    marginTop: "16px",
                },
                onMouseEnter,
                onMouseLeave,
                look: Button.Looks.BLANK,
                innerClassName: ButtonWrapperClasses.button,
                onClick: (evt) => {
                    rootProps.onClose();
                    if (evt.detail !== 0) {
                        openModal((props) => BdApi.React.createElement(ConfirmationModal, {
                            rootProps: props,
                            phrase: phrase
                        }));
                    }
                },
                className: invokeClasses("button")
            }, BdApi.React.createElement("div", {className: ButtonWrapperClasses.buttonWrapper}, BdApi.React.createElement("svg", {
                "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24", margin: "0 auto"
            }, BdApi.React.createElement("g", {
                fill: "none", "fill-rule": "evenodd"
            }, BdApi.React.createElement("path", {
                fill: "currentColor",
                d: "M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"
            }), BdApi.React.createElement("path", {
                fill: "currentColor",
                d: "M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"
            }), BdApi.React.createElement("rect", {
                style: {
                    width: "24",
                    height: "24"
                },
            }
            ))))))));
};


const creteButtons = (rootProps) => {
    const phrases = Object.values(JSON.parse(require("fs").readFileSync(require("path").join(BdApi.Plugins.folder, "config.js"), 'utf8')));
    const array = [];
    for (const phrase of phrases) {
        array.push(createButton(rootProps, phrase));
    }
    return array;
}

function ConfirmationModal({rootProps, phrase}) {
    return BdApi.React.createElement(ModalRoot, {...rootProps},
        BdApi.React.createElement(ModalHeader, {
                className: invokeClasses("del-header")
            },
            BdApi.React.createElement(Heading, {className: invokeClasses("phrase-del-heading")}, "Are you sure want to delete this phrase?")
        ),

        //body
        BdApi.React.createElement(ModalContent, {className: invokeClasses("del-content")},
            BdApi.React.createElement(Heading, {className: invokeClasses("phrase-del")}, phrase)
        ),

        //footer
        BdApi.React.createElement(ModalFooter, {
            className: invokeClasses("footer"),
        },
            BdApi.React.createElement(Button, {
                onClick: () => {
                    const phrases= Object.values(JSON.parse(require("fs").readFileSync(require("path").join(BdApi.Plugins.folder, "config.js"), 'utf8')));
                    if (phrases.length === 0) {
                        savePhrases([])
                    } else {
                        const newArray = [...phrases.slice(0, phrases.indexOf(phrase)), ...phrases.slice(phrases.indexOf(phrase) + 1)];
                        savePhrases(newArray)
                    }
                    rootProps.onClose();
                }
                //className: invokeClasses("menu"),
            }, "Delete"),
            BdApi.React.createElement(Button, {
                onClick: () => {
                    rootProps.onClose();
                }
                //className: invokeClasses("menu"),
            }, "Cancel")
        )

    );
}

function PickerModal({rootProps}) {
    const [textState, setText] = useState("");

    /*BdApi.React.useEffect(() => {
        console.log(textState)
    });*/

    let elements = creteButtons(rootProps);

    return BdApi.React.createElement(ModalRoot, {...rootProps},
        BdApi.React.createElement(ModalHeader, {
            className: invokeClasses("modal-header")
        },
        BdApi.React.createElement(TextInput, {
            style: {
                marginRight: "auto",
            },
            onChange: (text) => setText(text)
        },),
        BdApi.React.createElement(Button, {
            style: {
                marginLeft: "16px",
                marginRight: "auto",
            },
            onClick: () => {
                setText("")
                const phrases = Object.values(JSON.parse(require("fs").readFileSync(require("path").join(BdApi.Plugins.folder, "config.js"), 'utf8')));
                if (phrases.includes(textState) || textState === "") {
                    const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.SHAKE_APP, {
                        searchExports: true
                    });
                    ComponentDispatch.dispatch("SHAKE_APP", {duration: 500, intensity: 5});
                    BdApi.React.createElement(ModalCloseButton, {
                        className: invokeClasses("close-button"),
                        onClick: rootProps.onClose
                    })
                } else {
                    const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.SHAKE_APP, {
                        searchExports: true
                    });
                    console.log(ComponentDispatch)
                    phrases.push(textState);
                    savePhrases(phrases);
                    elements.push(createButton(rootProps, textState))
                }
            }
        }, 'Save'),

        BdApi.React.createElement(ModalCloseButton, {
            className: invokeClasses("close-button"),
            onClick: rootProps.onClose
        }),
        ),

        //body
        BdApi.React.createElement(ModalContent, {className: invokeClasses("modal-content")},
            ...elements
        ),

        //footer
        BdApi.React.createElement(Menu, {
            className: invokeClasses("menu"),
        })
    );
}

function ChatBarComponent() {
    return BdApi.React.createElement(Tooltip, {text: "Choose phrase"}, ({
                                                                               onMouseEnter,
                                                                               onMouseLeave
                                                                           }) => BdApi.React.createElement("div", {style: {marginTop: 10}}, BdApi.React.createElement(Button, {
        "aria-haspopup": "dialog",
        "aria-label": "",
        size: "",
        look: Button.Looks.BLANK,
        onMouseEnter,
        onMouseLeave,
        innerClassName: ButtonWrapperClasses.button,
        onClick: () => {
            openModal((props) => BdApi.React.createElement(PickerModal, {rootProps: props}));
        },
        className: invokeClasses("button")
    }, BdApi.React.createElement("div", {className: ButtonWrapperClasses.buttonWrapper}, BdApi.React.createElement("svg", {
        "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24"
    }, BdApi.React.createElement("g", {
        fill: "none", "fill-rule": "evenodd"
    },
    BdApi.React.createElement("path", {
        fill: "currentColor",
        d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z"
    }), BdApi.React.createElement("path", {
        fill: "currentColor",
        d: "M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z"
    }), BdApi.React.createElement("rect", {width: "24", height: "24"})))))));
}

// src/shared/findInReactTree.ts
function findInReactTree(root, filter) {
    return BdApi.Utils.findInTree(root, filter, {
        walkable: ["children", "props"]
    });
}

const styles_default = `
.vbd-its-menu {
    margin: 0 auto;  
    margin-bottom: 16px;
    margin-top: 16px;
    text-align: center;
}

.vbd-its-phrase-del-heading {
    
}

.vbd-its-del-header {
    justify-content: center;
    align-content: center;
    text-align: center;
}

.vbd-its-phrase-del {
    font-size: 25px;
    margin: auto;
    justify-content: center;
    text-align: center;
}

.vbd-its-footer {
    justify-content: space-around;
}

.vbd-its-del-content {
    display: flex;
    justify-content: center;
    align-items: center;
}

.vbd-its-close-button {
    margin-left: auto;  
}

.vbd-its-insert-button {
    margin: 16px auto;  
    white-space: normal;
    word-wrap: break-word;  
}

.vbd-its-modal-content input {
    background-color: var(--input-background);
    color: var(--text-normal);
    width: 95%;
    padding: 8px 8px 8px 12px;
    margin: 1em 0;
    outline: none;
    border: 1px solid var(--input-background);
    border-radius: 4px;
    font-weight: 500;
    font-style: inherit;
    font-size: 100%;
}

.vbd-its-format-label,
.vbd-its-format-label span {
    background-color: transparent;
}

.vbd-its-modal-content [class|="select"] {
    margin-bottom: 1em;
}

.vbd-its-modal-content [class|="select"] span {
    background-color: var(--input-background);
}

.vbd-its-modal-header {
    justify-content: space-between;
    align-content: center;
}

.vbd-its-modal-header h1 {
    margin: 0;
}

.vbd-its-modal-header button {
    padding: 0;
}

.vbd-its-preview-text {
    margin-bottom: 1em;
}

.vbd-its-button {
    padding: 0 6px;
}

.vbd-its-button svg {
    transform: scale(1.1) translateY(1px);
}
`;

// src/plugins/InsertTimestamps/index.jsx
const Chat = BdApi.Webpack.getModule((m) => m.Z?.type?.render?.toString().includes("chat input type must be set"));

function start() {
    BdApi.DOM.addStyle("vbd-st", styles_default);
    BdApi.Patcher.after("vbd-st", Chat.Z.type, "render", (_this, _args, res) => {
        const chatBar = findInReactTree(res, (n) => Array.isArray(n?.children) && n.children.some((c) => c?.props?.className?.startsWith("attachButton")))?.children;
        if (!chatBar) {
            console.error("InsertTimestamps: Couldn't find ChatBar component in React tree");
            return;
        }
        const buttons = findInReactTree(chatBar, (n) => n?.props?.showCharacterCount);
        if (buttons?.props.disabled) return;
        chatBar.splice(-1, 0, BdApi.React.createElement(ChatBarComponent, null));
    });
}

function stop() {
    BdApi.DOM.removeStyle("vbd-st");
    BdApi.Patcher.unpatchAll("vbd-st");
}

module.exports = () => ({
    start, stop
});