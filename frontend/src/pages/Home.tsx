import { Button } from "@/components/ui/button";

function Home() {
  return (
    <div className="flex justify-center items-center bg-background h-screen">
      <div className='text-white text-center'>
        <a href="/api/auth/google?state=/dashboard">
          <Button>Login with Google</Button>
        </a>
      </div>
    </div>
  );
};

export default Home;
