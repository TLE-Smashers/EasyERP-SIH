"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import LanguageToggle from "@/components/language-toggle";
import { 
  Users, 
  Building2, 
  BookOpen, 
  DollarSign, 
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>

      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50" suppressHydrationWarning>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logoEasyErp.png" 
              alt="Easy ERP Logo" 
              width={24}
              height={24}
              className="rounded-xs"
            />
            <span className="font-bold text-xl">Easy ERP</span>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <LanguageToggle />
            <Link href="/login">
              <Button variant="ghost">{t("login")}</Button>
            </Link>
            <Link href="/login">
              <Button>{t("getStarted")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>{t("tagline")}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t("heroLine1")}
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                {" "}{t("heroLine2")}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("heroDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="lg" className="text-lg h-12 px-8">
                  {t("startFreeTrial")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                {t("watchDemo")}
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{t("benefit1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{t("benefit2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{t("benefit3")}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            <div className="text-center">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">{t("statsCloud")}</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{t("statZero")}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("statsInvestment")}</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{t("statRealtime")}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("statDataSync")}</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground mt-1">{t("statUserRoles")}</div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {t("featureSectionTitle")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("featureSectionDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Admission Module */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("admissionTitle")}</CardTitle>
                <CardDescription>{t("admissionDesc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("admissionPoint1")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("admissionPoint2")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("admissionPoint3")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Accounts Module */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("accountsTitle")}</CardTitle>
                <CardDescription>{t("accountsDesc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("accountsPoint1")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("accountsPoint2")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("accountsPoint3")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Library Module */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("libraryTitle")}</CardTitle>
                <CardDescription>{t("libraryDesc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("libraryPoint1")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("libraryPoint2")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("libraryPoint3")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hostel Module */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("hostelTitle")}</CardTitle>
                <CardDescription>{t("hostelDesc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("hostelPoint1")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("hostelPoint2")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("hostelPoint3")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("analyticsTitle")}</CardTitle>
                <CardDescription>{t("analyticsDesc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("analyticsPoint1")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("analyticsPoint2")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("analyticsPoint3")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("securityTitle")}</CardTitle>
                <CardDescription>{t("securityDesc")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("securityPoint1")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("securityPoint2")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{t("securityPoint3")}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            <h2 className="text-3xl md:text-5xl font-bold">{t("ctaTitle")}</h2>

            <p className="text-lg opacity-90">
              {t("ctaDesc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg h-12 px-8">
                  {t("ctaDashboard")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="text-lg h-12 px-8 border-primary text-primary dark:text-primary-foreground"
              >
                {t("ctaDocs")}
              </Button>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image 
                  src="/logoEasyErp.png" 
                  alt="Easy ERP Logo" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-lg">Easy ERP</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("footerDescription")}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("footerSolution")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">{t("footerFeatures")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerArchitecture")}</Link></li>
                <li><Link href="/login" className="hover:text-primary">{t("footerLiveDemo")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerDocumentation")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("footerProject")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">{t("footerAboutSIH")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerPS")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerTeam")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerGithub")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("footerLegal")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">{t("footerPrivacy")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerTerms")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerCookie")}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t("footerLicense")}</Link></li>
              </ul>
            </div>

          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>{t("footerCopyright")}</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
