const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;

// 对模版进行编译处理
export function parseHTML(html) {
  // html最开始肯定是一个 <

  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; // 用于存放元素
  let currentParent; // 指向的是栈中的最后一个
  let root;

  // 最终转化成一颗ast
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }

  // 利用栈型结构来构造一棵树
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs);
    if (!root) {
      // 看一下是否是空树
      root = node; // 如果为空则当前是树的根节点
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node; // currentParent为战中的最后一个
  }

  function chars(text) {
    // 文本直接放到当前指向的节点中
    text = text.replace(/\s/g, "");
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }

  function end() {
    stack.pop(); // 弹出最后一个
    currentParent = stack[stack.length - 1];
  }

  function advance(n) {
    html = html.substring(n);
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束 就一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false; // 不是开始标签
  }

  while (html) {
    // 如果textEnd为0 说明是一个开始标签或者结束标签
    // 如果textEnd>0 说明就是文本的结束位置
    let textEnd = html.indexOf("<"); // 如果indexOf中的索引是0 则说明是个标签
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); // 开始标签的匹配结果
      if (startTagMatch) {
        // 解析到的开始标签
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end();
        advance(endTagMatch[0].length);
        continue;
      }
    }

    if (textEnd > 0) {
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        chars(text);
        advance(text.length); // 解析到的文本
      }
    }
  }

  return root;
}
