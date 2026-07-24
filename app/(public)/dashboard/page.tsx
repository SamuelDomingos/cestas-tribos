"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CampaignHeader } from "./_components/campaign-header"
import { MetasTab } from "./_components/metas-tab"
import { TribosTab } from "./_components/tribos-tab"
import { GcsTab } from "./_components/gcs-tab"
import { useCampaignData } from "./_hooks/use-campaign-data"
import { ShoppingBag, Shirt, RefreshCw, CloudOff, Target } from "lucide-react"
import { ModeToggle } from "@/components/modeToggle"

export default function DashboardPage() {
  const { data, isLoading, error } = useCampaignData()
  const [tab, setTab] = useState("metas")

  useEffect(() => {
    document.title = "Painel da Campanha | School"
  }, [])

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-b from-background to-muted/20">
      <CampaignHeader />

      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto w-full max-w-4xl px-4 pb-20">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-20">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando painél...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center gap-3 border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
              <CloudOff className="size-10 text-destructive" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="text-xs text-muted-foreground">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          )}

          {/* Abas + Conteúdo */}
          {data && !isLoading && (
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="sticky top-0 z-10 -mx-4 bg-background/80 px-4 pb-0 backdrop-blur-sm">
                <TabsList className="w-full">
                  <TabsTrigger value="metas" className="flex-1 gap-1.5">
                    <Target className="size-3.5" />
                    Metas
                  </TabsTrigger>
                  <TabsTrigger value="tribos" className="flex-1 gap-1.5">
                    <ShoppingBag className="size-3.5" />
                    Tribos
                  </TabsTrigger>
                  <TabsTrigger value="gcs" className="flex-1 gap-1.5">
                    <Shirt className="size-3.5" />
                    GCs
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="pt-6">
                <TabsContent value="metas">
                  <MetasTab
                    basketDel={data.totalBasketDel}
                    basketGoal={data.totalBasketGoal}
                    clothesDel={data.totalClothesDel}
                    clothesGoal={data.totalClothesGoal}
                    pctBasket={data.totalPctBasket}
                    pctClothes={data.totalPctClothes}
                  />
                </TabsContent>

                <TabsContent value="tribos">
                  <TribosTab tribes={data.tribes} />
                </TabsContent>

                <TabsContent value="gcs">
                  <GcsTab allGcs={data.allGcs} />
                </TabsContent>
              </div>
            </Tabs>
          )}

          {/* Footer */}
          <footer className="mt-8 border-t pt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shirt className="size-3 text-muted-foreground" />
              <ShoppingBag className="size-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">School</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Botão de tema */}
      <div className="fixed bottom-4 right-4 z-50">
        <ModeToggle />
      </div>
    </div>
  )
}
