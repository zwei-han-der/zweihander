import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../styles/MarkdownRenderer.css";

function MarkdownInput(props) {
  if (props.type === "checkbox") {
    return (
      <input
        type="checkbox"
        className="md-checkbox"
        checked={!!props.checked}
        readOnly
      />
    );
  }
  return <input {...props} />;
}

function MarkdownRenderer({ content, className = "" }) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ ...props }) => <h1 className="md-h1" {...props} />,
          h2: ({ ...props }) => <h2 className="md-h2" {...props} />,
          h3: ({ ...props }) => <h3 className="md-h3" {...props} />,
          h4: ({ ...props }) => <h4 className="md-h4" {...props} />,
          h5: ({ ...props }) => <h5 className="md-h5" {...props} />,
          h6: ({ ...props }) => <h6 className="md-h6" {...props} />,
          p: ({ node, children, ...props }) => {
            // Se o parágrafo contém apenas uma imagem, renderiza como div para evitar <div> dentro de <p>
            if (
              node &&
              node.children &&
              node.children.length === 1 &&
              node.children[0].type === "element" &&
              node.children[0].tagName === "img"
            ) {
              return (
                <div className="md-p md-img-paragraph" {...props}>
                  {children}
                </div>
              );
            }
            return <p className="md-p" {...props}>{children}</p>;
          },
          strong: ({ ...props }) => <strong className="md-strong" {...props} />,
          ul: ({ ...props }) => <ul className="md-ul" {...props} />,
          ol: ({ ...props }) => <ol className="md-ol" {...props} />,
          li: ({ ...props }) => <li className="md-li" {...props} />,
          a: ({ ...props }) => (
            <a
              className="md-link"
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="md-blockquote" {...props} />
          ),
          code: ({ inline, ...props }) =>
            inline ? (
              <code className="md-code-inline" {...props} />
            ) : (
              <code className="md-code-block" {...props} />
            ),
          pre: ({ children, ...props }) => {
            const codeElement = React.Children.only(children);
            const codeProps = codeElement.props || {};
            const codeClass = codeProps.className || "";
            const match = codeClass.match(/language-(\w+)/);
            const language = match ? match[1] : "plain";
            let codeText = "";

            if (codeProps && codeProps.children) {
              if (typeof codeProps.children === "string") {
                codeText = codeProps.children;
              } else if (Array.isArray(codeProps.children)) {
                codeText = codeProps.children
                  .map((child) =>
                    typeof child === "string"
                      ? child
                      : (child?.props?.children ?? ""),
                  )
                  .join("");
              } else if (
                typeof codeProps.children === "object" &&
                codeProps.children?.props?.children
              ) {
                codeText = codeProps.children.props.children;
              }
            }

            const handleCopy = () => {
              if (navigator && navigator.clipboard) {
                navigator.clipboard.writeText(codeText);
              }
            };

            return (
              <div className="md-codeblock-wrapper">
                <div className="md-codeblock-header">
                  <span className="md-codeblock-lang">{language}</span>
                  <button
                    className="md-codeblock-copy"
                    onClick={handleCopy}
                    title="Copiar código"
                  >
                    ⧉
                  </button>
                </div>
                <pre className="md-pre" {...props}>
                  {children}
                </pre>
              </div>
            );
          },
          table: ({ ...props }) => <table className="md-table" {...props} />,
          th: ({ ...props }) => <th className="md-th" {...props} />,
          td: ({ ...props }) => <td className="md-td" {...props} />,
          img: ({ src, alt, title }) => (
            <img className="md-img" src={src} alt={alt} title={title} />
          ),
          input: (props) => <MarkdownInput {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
