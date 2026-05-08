import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import Footer from './components/layout/Footer';
import PageContainer from './components/layout/PageContainer';
import {
    FileUploadSection,
    RetrieveContent,
    TextUploadSection,
} from './components/features';
import { FileTypeProvider } from './context/FileTypeProvider';
import { useFileType } from './context/FileTypeContext';

const VIEWS = {
    Text: TextUploadSection,
    Files: FileUploadSection,
    Retrieve: RetrieveContent,
};

function ActiveView() {
    const { fileType } = useFileType();
    const View = VIEWS[fileType] ?? TextUploadSection;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={fileType}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
            >
                <View />
            </motion.div>
        </AnimatePresence>
    );
}

function App() {
    return (
        <FileTypeProvider>
            <div className="app-backdrop flex min-h-screen flex-col">
                <Navbar />
                <Hero />
                <PageContainer className="flex-1 pb-16">
                    <ActiveView />
                </PageContainer>
                <Footer />
            </div>
        </FileTypeProvider>
    );
}

export default App;
