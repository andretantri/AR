<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ar_contents', function (Blueprint $table) {
            if (Schema::hasColumn('ar_contents', 'subject')) {
                $table->dropColumn('subject');
            }
            if (Schema::hasColumn('ar_contents', 'grade_level')) {
                $table->dropColumn('grade_level');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ar_contents', function (Blueprint $table) {
            $table->string('subject')->nullable();
            $table->string('grade_level')->nullable();
        });
    }
};
