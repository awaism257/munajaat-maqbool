// Munajaat Maqbool — Linux desktop wrapper (Flatpak).
//
// The whole app is the bundled, fully-offline web build from the repository
// root (index.html, app.js, styles.css, assets/, fonts/). It is served over a
// local-only custom URL scheme (app://local/...) by the handler below, so no
// network access is needed or requested. External links (e.g. the Ko-fi page)
// are handed to the system browser.

#include <QApplication>
#include <QCoreApplication>
#include <QDesktopServices>
#include <QDir>
#include <QFile>
#include <QIcon>
#include <QMainWindow>
#include <QMimeDatabase>
#include <QUrl>
#include <QWebEnginePage>
#include <QWebEngineProfile>
#include <QWebEngineUrlRequestJob>
#include <QWebEngineUrlScheme>
#include <QWebEngineUrlSchemeHandler>
#include <QWebEngineView>

static const QByteArray kScheme = QByteArrayLiteral("app");

// Serves files from the installed web root, read-only, with traversal blocked.
class LocalSchemeHandler : public QWebEngineUrlSchemeHandler
{
public:
    explicit LocalSchemeHandler(QString root, QObject *parent = nullptr)
        : QWebEngineUrlSchemeHandler(parent), m_root(std::move(root)) {}

    void requestStarted(QWebEngineUrlRequestJob *job) override
    {
        QString rel = job->requestUrl().path();
        if (rel.isEmpty() || rel == QLatin1String("/"))
            rel = QStringLiteral("/index.html");
        if (rel.contains(QLatin1String(".."))) {  // never escape the web root
            job->fail(QWebEngineUrlRequestJob::UrlNotFound);
            return;
        }
        const QString full = m_root + rel;
        auto *file = new QFile(full);
        if (!file->open(QIODevice::ReadOnly)) {
            file->deleteLater();
            job->fail(QWebEngineUrlRequestJob::UrlNotFound);
            return;
        }
        QObject::connect(job, &QObject::destroyed, file, &QObject::deleteLater);
        const QByteArray mime = QMimeDatabase().mimeTypeForFile(full).name().toUtf8();
        job->reply(mime, file);
    }

private:
    QString m_root;
};

// Sends real (external) links to the system browser instead of navigating away.
class Page : public QWebEnginePage
{
public:
    using QWebEnginePage::QWebEnginePage;

    bool acceptNavigationRequest(const QUrl &url, NavigationType type, bool isMainFrame) override
    {
        if (isMainFrame && type == NavigationTypeLinkClicked
            && url.scheme() != QLatin1String(kScheme)) {
            QDesktopServices::openUrl(url);
            return false;
        }
        return QWebEnginePage::acceptNavigationRequest(url, type, isMainFrame);
    }
};

int main(int argc, char *argv[])
{
    // Scheme registration must happen before any QWebEngine object exists.
    QWebEngineUrlScheme scheme(kScheme);
    scheme.setSyntax(QWebEngineUrlScheme::Syntax::Host);
    scheme.setFlags(QWebEngineUrlScheme::SecureScheme
                    | QWebEngineUrlScheme::LocalScheme
                    | QWebEngineUrlScheme::LocalAccessAllowed
                    | QWebEngineUrlScheme::CorsEnabled
#if QT_VERSION >= QT_VERSION_CHECK(6, 6, 0)
                    | QWebEngineUrlScheme::FetchApiAllowed
#endif
                    );
    QWebEngineUrlScheme::registerScheme(scheme);

    QApplication app(argc, argv);
    QApplication::setApplicationName(QStringLiteral("munajaat-maqbool"));
    QApplication::setApplicationDisplayName(QStringLiteral("Munajaat Maqbool"));
    QApplication::setOrganizationName(QStringLiteral("awaism257"));
    QApplication::setDesktopFileName(QStringLiteral("io.github.awaism257.munajaat-maqbool"));
    QApplication::setWindowIcon(QIcon::fromTheme(QStringLiteral("io.github.awaism257.munajaat-maqbool")));

    // Assets are installed at <prefix>/share/munajaat-maqbool/www
    const QString root = QDir(QCoreApplication::applicationDirPath()
                              + QStringLiteral("/../share/munajaat-maqbool/www")).canonicalPath();

    // Default profile persists localStorage (bookmarks, settings) across launches.
    auto *profile = QWebEngineProfile::defaultProfile();
    profile->installUrlSchemeHandler(kScheme, new LocalSchemeHandler(root, &app));

    QMainWindow window;
    auto *view = new QWebEngineView(&window);
    view->setPage(new Page(profile, view));
    QObject::connect(view, &QWebEngineView::titleChanged,
                     &window, &QMainWindow::setWindowTitle);
    window.setCentralWidget(view);
    window.resize(1000, 840);
    window.setMinimumSize(420, 600);
    window.show();

    view->setUrl(QUrl(QStringLiteral("app://local/index.html")));
    return QApplication::exec();
}
