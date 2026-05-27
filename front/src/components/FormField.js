
function FormPage({
    title,
    subtitle,
    icon,
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
                        <div className="card-header">
                            {icon ? <div className="card-header-icon">{icon}</div> : null}
                            <div className="card-header-text">
                                <Heading className="auth-panel-title">{title}</Heading>
                                {subtitle ? (
                                    <p className="auth-panel-subtitle">{subtitle}</p>
                                ) : null}
                            </div>
                        </div>
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