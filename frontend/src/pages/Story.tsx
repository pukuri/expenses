import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CloudUpload, HardDrive, KeyRound, LayoutDashboard, NotebookPen } from "lucide-react";
import ReactMarkdown from 'react-markdown';

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

function Story() {
  const introContent = `
I've been tracking my expenses using Google Sheets for years. It's simple, free, and gets the job done for basic logging. However, as my data grew, I hit a wall: no easy way to consolidate or aggregate monthly totals, running balances, or category breakdowns without manual formulas and pivots that broke on every update.

That's when I decided to build my own expenses tracker from scratch. This full-stack app (React frontend with TypeScript and Tailwind, Golang backend with raw PostgreSQL queries, Dockerized for local dev, and deployed on GCP Cloud Run) doubles as my portfolio showcase and a live learning lab for CI/CD, auth flows like OAuth, and cloud secrets. I'll use and iterate on it daily, turning real-world tweaks into bloggable improvements.

You can see the [full code here](https://github.com/pukuri/expenses). And here's a (not-so-much) detailed look at building the app step by step from the ground up.
  `;

  const planContent = `
After settling on the core idea, I sketched out the app architecture right away: split cleanly into backend for data handling and frontend for the user interface. This separation keeps concerns isolated. Backend manages secure CRUD on PostgreSQL (transactions with amounts, dates, categories, balances), while frontend focuses on intuitive display and inputs.

For the first phase, I designed a lean PostgreSQL schema with three core tables: users, transactions, and categories. Users handles authentication basics (ID, email from OAuth). Transactions captures essentials like ID, amount (positive/negative), description, category_id, date, and running balance. Categories stores names like "Food", "Transport", "Salary" for grouping.

Users serves purely for auth: dashboard access gated to verified sessions via Google OAuth flows (exploring my learning interest). No multi-tenant yet, just personal use with token validation on protected endpoints.

Transactions link to categories for rich insights. Frontend queries aggregate by category (e.g., SUM(amount) GROUP BY category.name WHERE date_trunc('month', date) = NOW()), showing pie charts or bars of monthly spends like "Rp 2.5M on Food" right on the dashboard.
  `;

  const backendContent1 = `
On the backend, Golang was the clear pick to keep infra costs minimal (tiny Cloud Run bills for low-traffic personal use) and push my skills with a compiled language. Beyond that, Go's stellar stdlib http and database/sql (pgx driver) let me stick to raw SQL for precise queries like monthly aggregates, dodging ORM overhead while enjoying blazing performance and easy Docker binaries. No runtime dependencies like Node's npm sprawl.

This marked my first time building a Golang backend app. Thanks to the ["Backend Engineering with Go" Udemy course](https://www.udemy.com/course/backend-engineering-with-go/learn/lecture/45983221#overview), I grasped Go backend structure and development practices. There's also a concise [Youtube Tutorial](https://www.youtube.com/watch?v=h3fqD6IprIA) from the same tutor.

Following the tutorial, the essentials boiled down to routing (using Chi), route handlers, and a database connection paired with the repository pattern for SQL queries. Why the repository pattern? It abstracts database logic, making code cleaner and more testable. More about repository pattern [in this article](https://threedots.tech/post/repository-pattern-in-go/).

Below is the snippet on how to use Chi for routing.
  `;

  const backendContent2 = `
This mount() function sets up the app's routes using Chi router, creating a clean, versioned API structure at /api/v1/transactions. The nested r.Route() calls group endpoints logically: POST / for creating transactions, GET / for listing all, then per-ID routes (e.g., /{transactionID}) for GET (view), DELETE, and PATCH (update) via dedicated handlers like app.createTransactionHandler. It returns the fully mounted http.Handler for the server to use, keeping routes RESTful and extensible.

Below is the snippet on how to handle transaction index.
  `;

  const backendContent3 = `
This indexTransactionHandler is the handler wired to GET /api/v1/transactions/ from the previous mount() router. It fetches all transactions via the repository (app.store.Transactions.Index(ctx)), handles errors by sending a 500 response, and returns the list as JSON with 200 OK status using a helper jsonResponse. Ties directly to the RESTful list endpoint, keeping handlers slim and delegating data access.

Below is the snippet on how the repository pattern store handle the db process.
  `;

  const backendContent4 = `
This Index method in TransactionStore (the repository from earlier) powers the indexTransactionHandler. It runs a SQL query joining transactions (t) with categories (c) to fetch full details: ID, category name/color, amount, running balance, description, date—ordered newest first (DESC). Uses context timeout for safety, scans rows into []TransactionGet slices, handles errors/row issues, and returns the list for JSON serialization, enabling rich frontend displays like category-grouped lists.

I decided to complete the full CRUD APIs on the backend first, ensuring they were fully consumable, before shifting focus to the frontend.
  `;

  const frontendContent1 = `
With the backend CRUD APIs solid and testable, I shifted to the frontend using React with TypeScript and Tailwind. The stack choice was deliberate: React's hooks and component model handle dynamic data flows perfectly, TypeScript ensures type-safe API responses match my Go structs, and Tailwind keeps styling fast and consistent across responsive breakpoints.

I prioritized core components first—a reusable table for transaction listings and input forms that feel effortless. The goal was clear: inputting expenses should take no more effort than my old Google Sheets workflow, so I built a single TransactionForm with category dropdowns, date pickers, and amount inputs (handling negatives for income) that submits directly via fetch API calls with simple state updates. No complex wizards or multi-step flows—just immediate, satisfying CRUD.

Using shadcn/ui accelerated polished components (DataTable, Form, Badge for categories) while keeping bundle size lean. Later iterations added monthly aggregates by consuming new API endpoints—dashboard graphs (bar charts for category spends, line charts for running balance trends) appeared progressively as backend support landed.

Below is the snippet on fetch transaction data hook.
  `;

  const frontendContent2 = `
For structure, I used nested components with a parent-level split: "Dashboard" (later auth-protected with custom hooks fetching live API data) and "Sample" (hardcoded mock data for development). Both pages share the same MainLayout component that consumes their data props and orchestrates children: main transaction table, input forms, and dashboard graphs—keeping UI logic DRY while isolating data sources.
  `;

  const authContent1 = `
Before deploying anything live, I refused to ship the app without proper authentication—open dashboards with financial data felt like a non-starter for a personal finance tool. Security first: no public access until login gates were solid.

I chose Google OAuth for its simplicity and built-in security, leveraging my existing Google account without building custom user flows. Implementation was straightforward: backend verifies OAuth tokens via Google's API, and I whitelisted only my specific email (Google account ID) in the app config. This single-user gatekeeps the Dashboard page while keeping Sample mode public for demos, striking the perfect balance for personal use with production-grade auth.

The backend Google OAuth implementation code snippet is quite lengthy, so I'll skip showing it here. Check the full details on the [GitHub repo]("https://github.com/pukuri/expenses/blob/main/backend/cmd/api/google.go") instead.

Then I implemented the auth middleware on my existing Chi router code to verify logged in user data before providing any finance data.
  `;

  const authContent2 = `
On the frontend, I used React Context to manage logged-in user data and attached it to all finance-related API requests. Check the [Github repo]("https://github.com/pukuri/expenses/blob/main/frontend/src/contexts/AuthContext.tsx") for the context implementation.
  `;

  const deploymentContent1 = `
With minimal deployment experience, I learned through targeted research and LLM guidance. No formal DevOps background, just practical problem-solving for my first full-stack push to production. I chose Cloudflare (with their registrar for DNS) for its generous free tier, zero-config HTTPS, and seamless GCP integration. 

Google Cloud Build handled CI/CD automation via a single cloudbuild.yaml at repo root. I used Google Secret Manager to securely store environment variables like database credentials and API URLs, injected automatically during builds. Frontend workflow stayed simple: build React static files (npm run build) and rsync to a Cloud Storage bucket (app.fachriakbarr.com) for cheap static hosting. Backend got Dockerized and deployed to Cloud Run, auto-connecting to Cloud SQL PostgreSQL via service connector.
Visit the [Github repo]("https://github.com/pukuri/expenses/blob/main/cloudbuild.yaml") for the full cloudbuild.yaml code that I developed.

One hiccup hit post-deploy: frontend pages returned 404s despite successful builds, thanks to Cloudflare's strict route mapping clashing with bucket paths. Fixed it cleanly with Cloudflare Workers. Route expenses.fachriakbarr.com/api/* to Cloud Run for backend APIs and the rest to the GCS bucket for frontend. Now everything flows: static UI loads instantly, API calls hit the right service, all proxied securely through Cloudflare.

Update January 6th: Turns out Google Cloud SQL is pretty expensive despite already using its lower spec machines. So I switched to [Neon]("https://neon.com/") and using its free tier. My app is not that SQL heavy anyway.

Below is the Cloudflare worker code to handle routing that I developed with the help of LLMs.
  `;

  const deploymentContent2 = `
This deployment stack turned a simple expense logger into a production-ready app: cost-effective, secure, and automated. From Google Sheets frustration to a live dashboard, the journey validated React+Go as my go-to full-stack combo.

The real win? A tool I actually use daily, with further planned improvements: caching, multi-user support, more data handling, or advanced charts next. Feedback welcome as I keep building in public.
  `;

  const goApiCodeExample = `
\`\`\`go
func (app *application) mount() http.Handler {
  r := chi.NewRouter()

  r.Route("/api", func(r chi.Router) {
    r.Route("/v1", func(r chi.Router) {
      r.Route("/transactions", func(r chi.Router) {
        r.Post("/", app.createTransactionHandler)
        r.Get("/", app.indexTransactionHandler)
        r.Route("/{transactionID}", func(r chi.Router) {
          r.Get("/", app.getTransactionHandler)
          r.Delete("/", app.deleteTransactionHandler)
          r.Patch("/", app.updateTransactionHandler)
        })
      })
    })
  })

  return r
}
\`\`\`
  `;

  const goHandlerCodeExample = `
\`\`\`go
func (app *application) indexTransactionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	transactions, err := app.store.Transactions.Index(ctx)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, transactions); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}
\`\`\`
  `;

  const goStoreCodeExample = `
\`\`\`go
func (s *TransactionStore) Index(ctx context.Context) ([]TransactionGet, error) {
	query := '
		SELECT t.id, c.name, c.color, t.amount, t.running_balance, t.description, t.date
		FROM transactions t
		LEFT JOIN categories c
			ON t.category_id = c.id
		ORDER BY id DESC
	'

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	var transactions []TransactionGet

	for rows.Next() {
		var transaction TransactionGet
		if err := rows.Scan(
			&transaction.ID, &transaction.CategoryName, &transaction.CategoryColor, &transaction.Amount, &transaction.RunningBalance, &transaction.Description, &transaction.Date,
		); err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return transactions, nil
}
\`\`\`
  `;
  
  const fetchHookCodeExample = `
\`\`\`js
export const useTransactions = () => {
  const [data, setData] = useState<TransactionsResponse>({ data: [] });

  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/transactions");
      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions().catch(console.error);
  }, []);

  return { data, fetchTransactions };
};
\`\`\`
  `;

  const authMiddlewareApiExample = `
\`\`\`go
r.Route("/api", func(r chi.Router) {
  r.Route("/v1", func(r chi.Router) {
    r.Use(app.authenticationMiddleware) // Adding this

    // ...existing code here
  })
})
\`\`\`
  `;

  const authMiddlewareHandlerExample = `
\`\`\`go
func (app *application) authenticationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_token")
		if err != nil {
			app.forbidden(w, r, err)
			return
		}

		secret := []byte(app.config.JwtSecret)
		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			return secret, nil
		})
		if err != nil || !token.Valid {
			app.forbidden(w, r, err)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		userId := int64(claims["user_id"].(float64))

		ctx := r.Context()
		user, err := app.store.Users.GetById(ctx, userId)
		if err != nil {
			app.forbidden(w, r, err)
			return
		}

		ctx = context.WithValue(r.Context(), authenticatedUser, user)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
\`\`\`
  `;

  const cloudflareCodeExample = `
\`\`\`js
const CLOUD_RUN_HOST = "yourapp.asia-southeast1.run.app"; 
const GCS_BUCKET_NAME = "bucketname"; 
const GCS_HOST = "storage.googleapis.com";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const isApiRequest = url.pathname.startsWith('/api')

  if (isApiRequest) {
    // 1. Route to Cloud Run API
    // Must rewrite the Host header for Cloud Run to accept the request
    const modifiedRequest = new Request(request, {
      headers: new Headers(request.headers),
    });
    modifiedRequest.headers.set('Host', CLOUD_RUN_HOST);
    
    // Rewrite the URL to the Cloud Run destination
    const destinationUrl = 'https://\${CLOUD_RUN_HOST}\${url.pathname}\${url.search}'
    
    return fetch(destinationUrl, modifiedRequest)
    
  } else {
    // 2. Route to GCS for Static Files
    // The bucket name must be the first path segment on the GCS host.
    let gcsPath = url.pathname
    
    // If the path is the root '/', request index.html (SPA entry point)
    if (gcsPath === '/') {
        gcsPath = '/index.html'
    }
    
    // Construct the GCS public URL: https://storage.googleapis.com/YOUR_BUCKET_NAME/path/to/file
    const destinationUrl = 'https://\${GCS_HOST}/\${GCS_BUCKET_NAME}\${gcsPath}\${url.search}'

    // Fetch from GCS
    const response = await fetch(destinationUrl, request)

    // Handle React SPA client-side routing: If GCS returns a 404 for a path (e.g., /report), 
    // it likely means the client-side router should handle it. Fallback to index.html.
    if (response.status === 404 && !gcsPath.includes('.')) {
        return fetch('https://\${GCS_HOST}/\${GCS_BUCKET_NAME}/index.html', request)
    }

    return response
  }
}
\`\`\`
  `;

  const textClass = "text-[16px] prose prose-p:text-[16px] prose-p:mb-4 max-w-120 md:max-w-none prose-a:text-blue-600 prose-a:underline text-white"
  const markdownClass = "text-[16px] mb-4 mx-auto prose prose-pre:bg-gray-900 prose-pre:border max-w-none prose-pre:text-sm"

  return (
    <div className="py-10 mx-auto max-w-360">
      <h1 className="text-center text-4xl">Expenses Tracker App From Zero</h1>
      <h2 className="text-center text-xl text-gray-500 pt-2">How I develop and deploy an app from scratch</h2>
      
      <div className="py-10 px-4 flex flex-col gap-4">
        <div className={textClass}>
          <ReactMarkdown components={{ a: LinkRenderer }}>
            {introContent}
          </ReactMarkdown>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-lg"><span className="flex flex-row gap-2"><NotebookPen /> The Plan</span></AccordionTrigger>
            <AccordionContent>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {planContent}
                </ReactMarkdown>
              </div>
              <img src='images/erdPhase1.png' className="max-w-150 m-auto my-4" alt="ERD for the first phase"/>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-bold text-lg"><span className="flex flex-row gap-2"><HardDrive /> The Backend</span></AccordionTrigger>
            <AccordionContent>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {backendContent1}
                </ReactMarkdown>
              </div>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {goApiCodeExample}
                </ReactMarkdown>
              </div>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {backendContent2}
                </ReactMarkdown>
              </div>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {goHandlerCodeExample}
                </ReactMarkdown>
              </div>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {backendContent3}
                </ReactMarkdown>
              </div>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {goStoreCodeExample}
                </ReactMarkdown>
              </div>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {backendContent4}
                </ReactMarkdown>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-bold text-lg"><span className="flex flex-row gap-2"><LayoutDashboard /> The Frontend</span></AccordionTrigger>
            <AccordionContent>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {frontendContent1}
                </ReactMarkdown>
              </div>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {fetchHookCodeExample}
                </ReactMarkdown>
              </div>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {frontendContent2}
                </ReactMarkdown>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="font-bold text-lg"><span className="flex flex-row gap-2"><KeyRound /> The Authentication</span></AccordionTrigger>
            <AccordionContent>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {authContent1}
                </ReactMarkdown>
              </div>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {authMiddlewareApiExample}
                </ReactMarkdown>
              </div>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {authMiddlewareHandlerExample}
                </ReactMarkdown>
              </div>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {authContent2}
                </ReactMarkdown>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="font-bold text-lg"><span className="flex flex-row gap-2"><CloudUpload /> The Deployment</span></AccordionTrigger>
            <AccordionContent>
              <img src='images/deployment1.png' className="m-auto my-4" alt="ERD for the first phase"/>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {deploymentContent1}
                </ReactMarkdown>
              </div>
              <img src='images/deployment2.png' className="m-auto my-4" alt="ERD for the first phase"/>
              <div className={markdownClass}>
                <ReactMarkdown>
                  {cloudflareCodeExample}
                </ReactMarkdown>
              </div>
              <div className={textClass}>
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {deploymentContent2}
                </ReactMarkdown>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export default Story;
