import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { LabelProps } from "@radix-ui/react-label";
import OpenAI from "openai";
import { useState } from "react";
import { Spinner } from "./components/spinner";
import background from "/Frame_7.png";

const client = new OpenAI({
  apiKey: import.meta.env["VITE_OPENAI_API_KEY"],
  dangerouslyAllowBrowser: true,
});

type FormState = "idle" | "loading" | "success" | "error";
function App() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState("loading");
    const formData = new FormData(event.currentTarget);
    // TODO: validate fields
    setOriginalText(formData.get("text") as string);
    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a professionnal translator. You only reply with the translated sentence, nothing else.",
          },
          {
            role: "user",
            content: `Translate: \`${formData.get("text")}\` in ${formData.get(
              "language"
            )}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      setTranslatedText(chatCompletion.choices[0].message.content || "");
      setFormState("success");
    } catch (error) {
      console.error(error);
      setFormState("error");
    }
  };

  const startOver = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState("idle");
    setOriginalText("");
    setTranslatedText("");
  };

  if (formState === "error") {
    return (
      <Shell>
        <Card className="pt-4">
          <CardContent>
            <p className="red-500">
              Something went wrong. Please try again later.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (formState === "loading") {
    return (
      <Shell>
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Shell>
    );
  }

  if (formState === "idle") {
    return (
      <Shell>
        <Card className="pt-4">
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-y-8">
              <div>
                <Heading htmlFor="text">Text to translate</Heading>
                <Textarea
                  key={formState}
                  name="text"
                  id="text"
                  required
                  placeholder="Example: How are you?"
                />
              </div>
              <div>
                <Heading htmlFor="language">Select language</Heading>
                <RadioGroup
                  id="language"
                  name="language"
                  defaultValue="french"
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="french" id="r1" />
                    <Label htmlFor="r1">French 🇫🇷</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spanish" id="r2" />
                    <Label htmlFor="r2">Spanish 🇪🇸</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="japanese" id="r3" />
                    <Label htmlFor="r3">Japanese 🇯🇵</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button>Translate</Button>
            </form>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (formState === "success") {
    return (
      <Shell>
        <Card className="pt-4">
          <CardContent>
            <form onSubmit={startOver} className="grid gap-y-8">
              <div>
                <Heading htmlFor="text">Original text</Heading>
                <Textarea
                  name="originalText"
                  id="originalText"
                  readOnly
                  value={originalText}
                />
              </div>
              <div>
                <Heading htmlFor="text">Translated text</Heading>
                <Textarea
                  name="translatedText"
                  id="translatedText"
                  readOnly
                  value={translatedText}
                />
              </div>
              <Button>Start Over</Button>
            </form>
          </CardContent>
        </Card>
      </Shell>
    );
  }
}

function Heading({ children, ...rest }: LabelProps) {
  return (
    <Label htmlFor="text" {...rest} className="text-center">
      {children} 👇
    </Label>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div
        className="w-full bg-contain aspect-video		"
        style={{ backgroundImage: `url(${background})` }}
      ></div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default App;
