import { Icon } from '../components/ui/Icon';
import React from 'react';

export const VIEWS = [
    {
        id: 'Text',
        label: 'Text',
        description: 'Share a snippet',
        icon: (props) => React.createElement(Icon, { name: 'text', ...props }),
    },
    {
        id: 'Files',
        label: 'Files',
        description: 'Upload files',
        icon: (props) => React.createElement(Icon, { name: 'upload', ...props }),
    },
    {
        id: 'Retrieve',
        label: 'Retrieve',
        description: 'Open with a code',
        icon: (props) => React.createElement(Icon, { name: 'inbox', ...props }),
    },
];
