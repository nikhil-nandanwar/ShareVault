
function PageContainer({ children, className = '' }) {
    return (
        <main
            className={[
                'mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8',
                className,
            ].join(' ')}
        >
            {children}
        </main>
    );
}

export default PageContainer;
