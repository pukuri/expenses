import { Button } from "@/components/ui/button";

function Home() {
  return (
    <div className="flex flex-col justify-center items-center bg-background h-screen">
      <div className='text-white text-center'>
        <a href="/api/auth/google?state=/dashboard">
          <Button>Login with Google</Button>
        </a>
      </div>
      <div className='text-white text-center pt-5'>
        <a href="/sample" className="">
          <Button variant="outline">Go to sample page</Button>
        </a>
      </div>
      <div className='text-white text-center pt-5'>
        <a href="/story" className="">
          <Button variant="outline">How I develop this app</Button>
        </a>
      </div>
    </div>
  );
};

export default Home;
