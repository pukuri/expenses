import { Button } from "@/components/ui/button";

function Home() {
  return (
    <div className="flex flex-col justify-center items-center bg-background h-screen">
      <div className='text-white text-center'>
        <a href="/api/auth/google?state=/dashboard">
          <Button>Login with Google</Button>
        </a>
      </div>
      <h1 className="pt-5 hover:underline">
        <a href="/sample" className="">
          or go to sample page
        </a>
      </h1>
    </div>
  );
};

export default Home;
