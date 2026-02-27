import ReactMarkdown from 'react-markdown';
import '../styles/MarkdownRenderer.css';

function MarkdownRenderer({ content, className = '' }) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({...props}) => <h1 className="md-h1" {...props} />,
          h2: ({...props}) => <h2 className="md-h2" {...props} />,
          h3: ({...props}) => <h3 className="md-h3" {...props} />,
          p: ({...props}) => <p className="md-p" {...props} />,
          ul: ({...props}) => <ul className="md-ul" {...props} />,
          ol: ({...props}) => <ol className="md-ol" {...props} />,
          li: ({...props}) => <li className="md-li" {...props} />,
          a: ({...props}) => <a className="md-link" {...props} target="_blank" rel="noopener noreferrer" />,
          blockquote: ({...props}) => <blockquote className="md-blockquote" {...props} />,
          code: ({inline, ...props}) => 
            inline 
              ? <code className="md-code-inline" {...props} />
              : <code className="md-code-block" {...props} />,
          pre: ({...props}) => <pre className="md-pre" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
