
function FormPage({
    title,
    onSubmit,
    cardClassName = "login-card",
    contentClassName,
    formClassName,
    buttonText,
    children,
    headingTag: Heading = "h1",
}) {
    return (
                <section className={cardClassName}>
                    <div className={contentClassName}>
                        <Heading className="auth-panel-title">{title}</Heading>
                        <form onSubmit={onSubmit} className={formClassName}>
                            {children}
                            <div className="basic-button">
                                <button type="submit">{buttonText}</button>
                            </div>
                        </form>
                    </div>
                </section>
    );
}

export default FormPage;