<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Copy existing data to ar_models
        $contents = \Illuminate\Support\Facades\DB::table('ar_contents')->get();
        foreach ($contents as $content) {
            \Illuminate\Support\Facades\DB::table('ar_models')->insert([
                'ar_content_id' => $content->id,
                'name' => 'Default Model',
                'file_path' => $content->file_path,
                'file_name' => $content->file_name,
                'file_type' => $content->file_type,
                'file_size' => $content->file_size,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('ar_contents', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_name', 'file_type', 'file_size']);
        });
    }

    public function down(): void
    {
        Schema::table('ar_contents', function (Blueprint $table) {
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->default('pblr');
            $table->bigInteger('file_size')->default(0);
        });
    }
};
