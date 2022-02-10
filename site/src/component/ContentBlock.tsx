import React from 'react';

interface IContentBlockProps {
    title?: string;
    children: React.ReactChild | React.ReactChild[];
}

function ContentBlock(props: IContentBlockProps) {
    return (
        <>
            <div className='section'>
                {props.title &&
                    <h5>
                        {props.title}
                    </h5>
                }
                {props.children}
            </div>
            <div className='divider'></div>
        </>
    );
}

export default ContentBlock;